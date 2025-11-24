'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { MessageSquare, Plus, ArrowLeft, Send, User, Heart, Bookmark, Hash, X, Search } from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: string;
  threadId: string;
}

interface Node {
  id: string;
  title: string;
  tier: number;
}

interface Thread {
  id: string;
  title: string;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  postCount: number;
  posts?: Post[];
  likes?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  tags?: string[];
}

export default function BoardPage() {
  const { data: session, status } = useSession();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableNodes, setAvailableNodes] = useState<Node[]>([]);
  const [nodesByTier, setNodesByTier] = useState<{ tier1: Node[]; tier2: Node[]; tier3: Node[] }>({ tier1: [], tier2: [], tier3: [] });
  const [searchTag, setSearchTag] = useState<string | null>(null);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [formTagSearchQuery, setFormTagSearchQuery] = useState('');
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [loading, setLoading] = useState(true);

  // ノード一覧を読み込む
  useEffect(() => {
    loadNodes();
  }, []);

  // ドロップダウン外をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showTagSelector && !target.closest('.tag-selector-container')) {
        setShowTagSelector(false);
      }
    };

    if (showTagSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTagSelector]);

  // スレッド一覧を読み込む
  useEffect(() => {
    if (showBookmarks) {
      loadBookmarks();
    } else {
      loadThreads();
    }
  }, [showBookmarks, searchTag]);

  const loadNodes = async () => {
    try {
      const response = await fetch('/api/nodes');
      if (response.ok) {
        const data = await response.json();
        setAvailableNodes(data.all || []);
        setNodesByTier({
          tier1: data.byTier?.tier1 || [],
          tier2: data.byTier?.tier2 || [],
          tier3: data.byTier?.tier3 || [],
        });
      }
    } catch (error) {
      console.error('Failed to load nodes:', error);
    }
  };

  const loadThreads = async () => {
    try {
      const url = searchTag ? `/api/threads?tag=${encodeURIComponent(searchTag)}` : '/api/threads';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const response = await fetch('/api/threads?action=bookmarks');
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      } else if (response.status === 401) {
        setThreads([]);
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  // スレッドを選択して詳細を読み込む
  const handleThreadSelect = async (threadId: string) => {
    try {
      const response = await fetch(`/api/threads?threadId=${threadId}`);
      if (response.ok) {
        const thread = await response.json();
        setSelectedThread(thread);
        setShowNewThreadForm(false);
      }
    } catch (error) {
      console.error('Failed to load thread:', error);
    }
  };

  // いいねをトグル
  const handleToggleLike = async (threadId: string, currentIsLiked: boolean) => {
    if (!session) {
      alert('いいねするにはログインが必要です');
      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          action: currentIsLiked ? 'unlike' : 'like',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // スレッド一覧を更新
        setThreads(prevThreads =>
          prevThreads.map(thread =>
            thread.id === threadId
              ? { ...thread, likes: data.likes, isLiked: data.isLiked }
              : thread
          )
        );
        // 選択中のスレッドも更新
        if (selectedThread && selectedThread.id === threadId) {
          setSelectedThread({ ...selectedThread, likes: data.likes, isLiked: data.isLiked });
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // ブックマークをトグル
  const handleToggleBookmark = async (threadId: string, currentIsBookmarked: boolean) => {
    if (!session) {
      alert('ブックマークするにはログインが必要です');
      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          action: currentIsBookmarked ? 'unbookmark' : 'bookmark',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // スレッド一覧を更新
        setThreads(prevThreads =>
          prevThreads.map(thread =>
            thread.id === threadId
              ? { ...thread, isBookmarked: data.isBookmarked }
              : thread
          )
        );
        // 選択中のスレッドも更新
        if (selectedThread && selectedThread.id === threadId) {
          setSelectedThread({ ...selectedThread, isBookmarked: data.isBookmarked });
        }
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  // 新しいスレッドを作成
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert('スレッドを作成するにはログインが必要です');
      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    if (!newThreadTitle.trim() || !newPostContent.trim()) {
      alert('タイトルと本文を入力してください');
      return;
    }

    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newThreadTitle,
          content: newPostContent,
          tags: selectedTags,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewThreadTitle('');
        setNewPostContent('');
        setSelectedTags([]);
        setShowNewThreadForm(false);
        loadThreads();
        // 作成したスレッドを表示
        handleThreadSelect(data.thread.id);
      } else {
        const error = await response.json();
        alert('スレッドの作成に失敗しました: ' + (error.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('Failed to create thread:', error);
      alert('スレッドの作成に失敗しました');
    }
  };

  // 投稿を追加
  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread) return;
    if (!session) {
      alert('投稿するにはログインが必要です');
      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    if (!newPostContent.trim()) {
      alert('投稿内容を入力してください');
      return;
    }

    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: selectedThread.id,
          content: newPostContent,
        }),
      });

      if (response.ok) {
        setNewPostContent('');
        // スレッドを再読み込み
        handleThreadSelect(selectedThread.id);
        loadThreads();
      } else {
        const error = await response.json();
        alert('投稿に失敗しました: ' + (error.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('Failed to add post:', error);
      alert('投稿に失敗しました');
    }
  };

  // 日時をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* ヘッダー */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ホームに戻る</span>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              掲示板
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {session && (
              <>
                <button
                  onClick={() => {
                    setShowBookmarks(!showBookmarks);
                    setSelectedThread(null);
                    setShowNewThreadForm(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    showBookmarks
                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  ブックマーク
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <User className="w-4 h-4" />
                  <span>{session.user?.name || session.user?.email}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4">
        {!selectedThread ? (
          // スレッド一覧
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{showBookmarks ? 'ブックマーク一覧' : 'スレッド一覧'}</h2>
              {!showBookmarks && (
                <button
                  onClick={() => {
                    if (!session) {
                      alert('スレッドを作成するにはログインが必要です');
                      signIn('google', { callbackUrl: window.location.href });
                      return;
                    }
                    setShowNewThreadForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  新規スレッド
                </button>
              )}
            </div>

            {/* タグ検索 */}
            {!showBookmarks && (
              <div className="mb-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="タグで検索（ノード名を入力）"
                    />
                  </div>
                  {searchTag && (
                    <button
                      onClick={() => {
                        setSearchTag(null);
                        setTagSearchQuery('');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                      検索をクリア
                    </button>
                  )}
                </div>
                {tagSearchQuery && (
                  <div className="mt-4 max-h-60 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {availableNodes
                        .filter(node => 
                          node.title.toLowerCase().includes(tagSearchQuery.toLowerCase()) ||
                          node.id.toLowerCase().includes(tagSearchQuery.toLowerCase())
                        )
                        .slice(0, 20)
                        .map(node => (
                          <button
                            key={node.id}
                            onClick={() => {
                              setSearchTag(node.id);
                              setTagSearchQuery(node.title);
                            }}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              searchTag === node.id
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <Hash className="w-3 h-3 inline mr-1" />
                            {node.title}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
                {searchTag && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-400">検索中: </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-600 text-white rounded text-sm">
                      <Hash className="w-3 h-3" />
                      {availableNodes.find(n => n.id === searchTag)?.title || searchTag}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 新規スレッド作成フォーム */}
            {showNewThreadForm && (
              <div className="mb-6 p-6 bg-gray-900 border border-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">新規スレッドを作成</h3>
                <form onSubmit={handleCreateThread}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">タイトル</label>
                    <input
                      type="text"
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="スレッドタイトルを入力"
                      maxLength={100}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">最初の投稿</label>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      rows={6}
                      placeholder="投稿内容を入力"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">タグ（トピック）</label>
                    
                    {/* 選択されたタグの表示 */}
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedTags.map(tagId => {
                          const node = availableNodes.find(n => n.id === tagId);
                          return (
                            <span
                              key={tagId}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-600 text-white rounded text-sm"
                            >
                              <Hash className="w-3 h-3" />
                              {node?.title || tagId}
                              <button
                                type="button"
                                onClick={() => setSelectedTags(selectedTags.filter(id => id !== tagId))}
                                className="ml-1 hover:text-gray-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* タグ選択ボタン */}
                    <div className="relative tag-selector-container">
                      <button
                        type="button"
                        onClick={() => setShowTagSelector(!showTagSelector)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white text-left flex items-center justify-between hover:border-cyan-500 transition-colors"
                      >
                        <span className="text-gray-400">
                          {selectedTags.length > 0 
                            ? `${selectedTags.length}個のタグが選択されています`
                            : 'タグを選択してください'}
                        </span>
                        <span className="text-gray-400">▼</span>
                      </button>

                      {/* タグ選択ドロップダウン */}
                      {showTagSelector && (
                        <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
                          {/* 検索バー */}
                          <div className="p-3 border-b border-gray-700">
                            <input
                              type="text"
                              value={formTagSearchQuery}
                              onChange={(e) => setFormTagSearchQuery(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              placeholder="タグを検索..."
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* タグリスト */}
                          <div className="overflow-y-auto flex-1">
                            {/* Tier 1 */}
                            {nodesByTier.tier1.length > 0 && (
                              <div className="p-2">
                                <div className="text-xs font-semibold text-gray-500 mb-2 px-2">大分類</div>
                                {nodesByTier.tier1
                                  .filter(node => 
                                    !formTagSearchQuery ||
                                    node.title.toLowerCase().includes(formTagSearchQuery.toLowerCase()) ||
                                    node.id.toLowerCase().includes(formTagSearchQuery.toLowerCase())
                                  )
                                  .map(node => (
                                    <label
                                      key={node.id}
                                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedTags.includes(node.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedTags([...selectedTags, node.id]);
                                          } else {
                                            setSelectedTags(selectedTags.filter(id => id !== node.id));
                                          }
                                        }}
                                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <span className="text-sm text-white">{node.title}</span>
                                    </label>
                                  ))}
                              </div>
                            )}

                            {/* Tier 2 */}
                            {nodesByTier.tier2.length > 0 && (
                              <div className="p-2 border-t border-gray-700">
                                <div className="text-xs font-semibold text-gray-500 mb-2 px-2">中分類</div>
                                {nodesByTier.tier2
                                  .filter(node => 
                                    !formTagSearchQuery ||
                                    node.title.toLowerCase().includes(formTagSearchQuery.toLowerCase()) ||
                                    node.id.toLowerCase().includes(formTagSearchQuery.toLowerCase())
                                  )
                                  .map(node => (
                                    <label
                                      key={node.id}
                                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedTags.includes(node.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedTags([...selectedTags, node.id]);
                                          } else {
                                            setSelectedTags(selectedTags.filter(id => id !== node.id));
                                          }
                                        }}
                                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <span className="text-sm text-white">{node.title}</span>
                                    </label>
                                  ))}
                              </div>
                            )}

                            {/* Tier 3 */}
                            {nodesByTier.tier3.length > 0 && (
                              <div className="p-2 border-t border-gray-700">
                                <div className="text-xs font-semibold text-gray-500 mb-2 px-2">小分類</div>
                                {nodesByTier.tier3
                                  .filter(node => 
                                    !formTagSearchQuery ||
                                    node.title.toLowerCase().includes(formTagSearchQuery.toLowerCase()) ||
                                    node.id.toLowerCase().includes(formTagSearchQuery.toLowerCase())
                                  )
                                  .map(node => (
                                    <label
                                      key={node.id}
                                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedTags.includes(node.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedTags([...selectedTags, node.id]);
                                          } else {
                                            setSelectedTags(selectedTags.filter(id => id !== node.id));
                                          }
                                        }}
                                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <span className="text-sm text-white">{node.title}</span>
                                    </label>
                                  ))}
                              </div>
                            )}
                          </div>

                          {/* 閉じるボタン */}
                          <div className="p-3 border-t border-gray-700">
                            <button
                              type="button"
                              onClick={() => setShowTagSelector(false)}
                              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                            >
                              閉じる
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
                    >
                      作成
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewThreadForm(false);
                        setNewThreadTitle('');
                        setNewPostContent('');
                        setSelectedTags([]);
                        setFormTagSearchQuery('');
                        setShowTagSelector(false);
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* スレッドリスト */}
            {threads.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>
                  {showBookmarks
                    ? 'ブックマークしたスレッドがありません。'
                    : 'まだスレッドがありません。最初のスレッドを作成しましょう！'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className="p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-cyan-600 transition-colors"
                  >
                    <div 
                      onClick={() => handleThreadSelect(thread.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{thread.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                            <span>投稿者: {thread.author}</span>
                            <span>投稿数: {thread.postCount}</span>
                            <span>更新: {formatDate(thread.updatedAt)}</span>
                          </div>
                          {thread.tags && thread.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {thread.tags.map(tagId => {
                                const node = availableNodes.find(n => n.id === tagId);
                                return (
                                  <button
                                    key={tagId}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSearchTag(tagId);
                                      setTagSearchQuery(node?.title || tagId);
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-cyan-600 text-gray-300 hover:text-white rounded text-xs transition-colors"
                                  >
                                    <Hash className="w-3 h-3" />
                                    {node?.title || tagId}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-800">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLike(thread.id, thread.isLiked || false);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
                          thread.isLiked
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${thread.isLiked ? 'fill-current' : ''}`} />
                        <span>{thread.likes || 0}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBookmark(thread.id, thread.isBookmarked || false);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
                          thread.isBookmarked
                            ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${thread.isBookmarked ? 'fill-current' : ''}`} />
                        <span>ブックマーク</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // スレッド詳細
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  setSelectedThread(null);
                  setNewPostContent('');
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                スレッド一覧に戻る
              </button>
              {searchTag && (
                <button
                  onClick={() => {
                    setSearchTag(null);
                    setTagSearchQuery('');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                  検索をクリア
                </button>
              )}
            </div>

            <div className="mb-6 p-6 bg-gray-900 border border-gray-800 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">{selectedThread.title}</h2>
              {selectedThread.tags && selectedThread.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedThread.tags.map(tagId => {
                    const node = availableNodes.find(n => n.id === tagId);
                    return (
                      <button
                        key={tagId}
                        onClick={() => {
                          setSelectedThread(null);
                          setSearchTag(tagId);
                          setTagSearchQuery(node?.title || tagId);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm transition-colors"
                      >
                        <Hash className="w-4 h-4" />
                        {node?.title || tagId}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  作成者: {selectedThread.author} | 作成日: {formatDate(selectedThread.createdAt)} | 投稿数: {selectedThread.postCount}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleLike(selectedThread.id, selectedThread.isLiked || false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                      selectedThread.isLiked
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${selectedThread.isLiked ? 'fill-current' : ''}`} />
                    <span>{selectedThread.likes || 0}</span>
                  </button>
                  <button
                    onClick={() => handleToggleBookmark(selectedThread.id, selectedThread.isBookmarked || false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                      selectedThread.isBookmarked
                        ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${selectedThread.isBookmarked ? 'fill-current' : ''}`} />
                    <span>ブックマーク</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 投稿一覧 */}
            <div className="space-y-4 mb-6">
              {selectedThread.posts?.map((post, index) => (
                <div
                  key={post.id}
                  className="p-4 bg-gray-900 border border-gray-800 rounded-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-cyan-400">{post.author}</span>
                        <span className="text-sm text-gray-500">
                          {post.authorId} ID:{post.authorId.slice(0, 8)}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="text-gray-300 whitespace-pre-wrap">{post.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 投稿フォーム */}
            <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">投稿する</h3>
              {!session ? (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-4">投稿するにはログインが必要です</p>
                  <button
                    onClick={() => signIn('google', { callbackUrl: window.location.href })}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
                  >
                    ログイン
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddPost}>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
                    rows={6}
                    placeholder="投稿内容を入力"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    投稿
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

