'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Plus, ArrowUpDown, LogIn, LogOut, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import HierarchySidebar from '@/components/HierarchySidebar';
import SidePanel from '@/components/SidePanel';
import ResourceCard from '@/components/ResourceCard';
import AddResourceForm from '@/components/AddResourceForm';
import { nodes, links, Node, Resource } from '@/data';

interface AutoResource extends Resource {
  summary?: string;
}

type SortOrder = 'rating-desc' | 'rating-asc' | 'avg-rating-desc' | 'avg-rating-asc' | 'newest' | 'oldest';

export default function Home() {
  const { data: session, status } = useSession();
  // デフォルトで記述統計学を選択
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('descriptive-stats');
  const [selectedNode, setSelectedNode] = useState<Node | null>(
    nodes.find(n => n.id === 'descriptive-stats') || null
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [autoResources, setAutoResources] = useState<Record<string, AutoResource[]>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('avg-rating-desc');

  // 自動収集されたリソースを読み込む
  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then(data => setAutoResources(data))
      .catch(err => console.error('Failed to load resources:', err));
  }, []);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
    }
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedNode(node);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  // 初期画面に戻る
  const handleResetToHome = () => {
    const defaultNodeId = 'descriptive-stats';
    const defaultNode = nodes.find(n => n.id === defaultNodeId) || null;
    setSelectedNodeId(defaultNodeId);
    setSelectedNode(defaultNode);
    setIsPanelOpen(false);
    setShowAddForm(false);
  };

  // 選択されたノードのリソースを取得（自動収集 + ユーザー追加）
  const getNodeResources = (node: Node | null): Resource[] => {
    if (!node) return [];
    
    const auto = autoResources[node.id] || [];
    const manual = node.resources || [];
    
    // 自動収集されたリソースと手動定義のリソースをマージ
    const resourceMap = new Map<string, Resource>();
    
    // まず手動定義のリソースを追加
    manual.forEach(resource => {
      resourceMap.set(resource.url, resource as Resource);
    });
    
    // 自動収集のリソースで上書き（要約があるため）
    auto.forEach(resource => {
      const existing = resourceMap.get(resource.url);
      if (existing) {
        // 既存のリソースの評価を保持（ratingsを優先）
        resourceMap.set(resource.url, { 
          ...resource, 
          ratings: existing.ratings || resource.ratings,
          rating: existing.rating || resource.rating 
        });
      } else {
        resourceMap.set(resource.url, resource);
      }
    });
    
    return Array.from(resourceMap.values());
  };

  // 平均評価を計算する関数
  const calculateAverageRating = (resource: Resource): number => {
    if (resource.ratings && resource.ratings.length > 0) {
      const sum = resource.ratings.reduce((acc, r) => acc + r.rating, 0);
      return sum / resource.ratings.length;
    }
    return resource.rating || 0;
  };

  // 現在のユーザーの評価を取得する関数
  const getCurrentUserRating = (resource: Resource): number => {
    if (!session?.user) return 0;
    const userId = session.user.id || session.user.email;
    if (resource.ratings) {
      const userRating = resource.ratings.find(r => r.userId === userId);
      return userRating?.rating || 0;
    }
    return resource.rating || 0;
  };

  // リソースを評価順でソート
  const sortedResources = useMemo(() => {
    const resources = getNodeResources(selectedNode);
    const sorted = [...resources];
    
    switch (sortOrder) {
      case 'rating-desc':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'rating-asc':
        return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case 'avg-rating-desc':
        return sorted.sort((a, b) => calculateAverageRating(b) - calculateAverageRating(a));
      case 'avg-rating-asc':
        return sorted.sort((a, b) => calculateAverageRating(a) - calculateAverageRating(b));
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
          const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
          return dateB - dateA;
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
          const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
          return dateA - dateB;
        });
      default:
        return sorted;
    }
  }, [selectedNode, autoResources, sortOrder, session]);

  // リソースを追加
  const handleAddResource = async (resource: Resource) => {
    if (!selectedNodeId) return;

    if (!session) {
      alert('リソースを追加するにはログインが必要です');
      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: selectedNodeId,
          resource: {
            ...resource,
            addedBy: session.user?.name || session.user?.email || '匿名',
          },
          action: 'add',
        }),
      });

      if (response.ok) {
        // リソースをローカル状態に追加
        setAutoResources(prev => ({
          ...prev,
          [selectedNodeId]: [...(prev[selectedNodeId] || []), resource],
        }));
      } else {
        const error = await response.json();
        if (response.status === 401) {
          alert('ログインが必要です');
          signIn('google', { callbackUrl: window.location.href });
        } else {
          alert('リソースの追加に失敗しました: ' + (error.error || '不明なエラー'));
        }
      }
    } catch (error) {
      console.error('Failed to add resource:', error);
      alert('リソースの追加に失敗しました');
    }
  };

  // リソースの評価を更新
  const handleRateResource = async (url: string, rating: number) => {
    if (!selectedNodeId) return;

    const resource = sortedResources.find(r => r.url === url);
    if (!resource) return;

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: selectedNodeId,
          resource: { url, rating },
          action: 'update',
        }),
      });

      if (response.ok) {
        // リソースをローカル状態に更新
        setAutoResources(prev => {
          const nodeResources = prev[selectedNodeId] || [];
          const updated = nodeResources.map((r: any) =>
            r.url === url ? { ...r, rating } : r
          );
          // リソースが存在しない場合は追加
          if (!updated.find((r: any) => r.url === url)) {
            updated.push({ ...resource, rating });
          }
          return { ...prev, [selectedNodeId]: updated };
        });
        
        // リソースリストを再読み込みして確実に反映
        const refreshResponse = await fetch('/api/resources');
        if (refreshResponse.ok) {
          const refreshed = await refreshResponse.json();
          setAutoResources(refreshed);
        }
      } else {
        const error = await response.json();
        console.error('Failed to rate resource:', error);
        alert('評価の保存に失敗しました');
      }
    } catch (error) {
      console.error('Failed to rate resource:', error);
      alert('評価の保存に失敗しました');
    }
  };

  // リソースを削除
  const handleRemoveResource = async (url: string) => {
    if (!selectedNodeId) return;
    if (!confirm('このリソースを削除しますか？')) return;

    const resource = sortedResources.find(r => r.url === url);
    if (!resource) return;

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: selectedNodeId,
          resource: { url },
          action: 'remove',
        }),
      });

      if (response.ok) {
        // リソースをローカル状態から削除
        setAutoResources(prev => {
          const nodeResources = prev[selectedNodeId] || [];
          const filtered = nodeResources.filter((r: any) => r.url !== url);
          return { ...prev, [selectedNodeId]: filtered };
        });
      }
    } catch (error) {
      console.error('Failed to remove resource:', error);
      alert('リソースの削除に失敗しました');
    }
  };

  return (
    <main className="flex w-full h-screen overflow-hidden bg-black">
      {/* Left Sidebar - Hierarchy */}
      <div className="flex flex-col w-80 h-full bg-gray-900 border-r border-gray-800">
        {/* Title */}
        <div className="p-6 border-b border-gray-800">
          <h1 
            onClick={handleResetToHome}
            className="text-2xl font-bold text-white mb-4 cursor-pointer hover:text-cyan-400 transition-colors"
          >
            Data Science Knowledge
          </h1>
          
          {/* 掲示板へのリンク */}
          <Link
            href="/board"
            className="flex items-center gap-2 px-4 py-2 mb-4 w-full bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            掲示板
          </Link>
          
          {/* 認証状態 */}
          {status === 'loading' ? (
            <div className="text-sm text-gray-400">読み込み中...</div>
          ) : session ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <User className="w-4 h-4" />
                <span className="truncate">{session.user?.name || session.user?.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
              >
                <LogOut className="w-3 h-3" />
                ログアウト
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="flex items-center gap-2 px-4 py-2 w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm"
            >
              <LogIn className="w-4 h-4" />
              Googleでログイン
            </button>
          )}
        </div>
        
        <HierarchySidebar
          nodes={nodes}
          links={links}
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
        />
      </div>

      {/* Right Side - Content Area */}
      <div className="flex-1 relative bg-gray-900 overflow-y-auto">
        {selectedNode ? (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">{selectedNode.title}</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">{selectedNode.description}</p>
              
              {/* Resources Section */}
              {sortedResources.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">学習リソース</h3>
                    <div className="flex items-center gap-3">
                      {/* ソート選択 */}
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        <select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="avg-rating-desc">平均評価が高い順</option>
                          <option value="avg-rating-asc">平均評価が低い順</option>
                          <option value="rating-desc">あなたの評価が高い順</option>
                          <option value="rating-asc">あなたの評価が低い順</option>
                          <option value="newest">新しい順</option>
                          <option value="oldest">古い順</option>
                        </select>
                      </div>
                      
                      {/* リソース追加ボタン */}
                      <button
                        onClick={() => {
                          if (!session) {
                            alert('リソースを追加するにはログインが必要です');
                            signIn('google', { callbackUrl: window.location.href });
                            return;
                          }
                          setShowAddForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        リソースを追加
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {sortedResources.map((resource, index) => (
                      <ResourceCard
                        key={`${resource.url}-${index}`}
                        resource={resource}
                        onRate={handleRateResource}
                        onRemove={resource.userAdded ? handleRemoveResource : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {sortedResources.length === 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">学習リソース</h3>
                    <button
                      onClick={() => {
                        if (!session) {
                          alert('リソースを追加するにはログインが必要です');
                          signIn('google', { callbackUrl: window.location.href });
                          return;
                        }
                        setShowAddForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      リソースを追加
                    </button>
                  </div>
                  <p className="text-gray-500 text-center py-8">
                    まだリソースがありません。おすすめのリソースを追加してください。
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <p className="text-lg mb-2">ノードを選択してください</p>
              <p className="text-sm">左側のサイドバーから単元を選択すると、詳細情報が表示されます</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Resource Form */}
      {showAddForm && selectedNode && (
        <AddResourceForm
          nodeId={selectedNode.id}
          nodeTitle={selectedNode.title}
          onAdd={handleAddResource}
          onClose={() => setShowAddForm(false)}
        />
      )}

      <SidePanel
        node={selectedNode}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </main>
  );
}
