'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Resource } from '@/data';

interface AddResourceFormProps {
  nodeId: string;
  nodeTitle: string;
  onAdd: (resource: Resource) => void;
  onClose: () => void;
}

export default function AddResourceForm({ nodeId, nodeTitle, onAdd, onClose }: AddResourceFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<Resource['type']>('article');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !url.trim()) {
      alert('タイトルとURLを入力してください');
      return;
    }

    // URLの形式をチェック
    try {
      new URL(url);
    } catch {
      alert('有効なURLを入力してください');
      return;
    }

    const resource: Resource = {
      title: title.trim(),
      url: url.trim(),
      type,
      userAdded: true,
      addedAt: new Date().toISOString(),
      rating: 0,
    };

    onAdd(resource);
    
    // フォームをリセット
    setTitle('');
    setUrl('');
    setType('article');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">リソースを追加</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          {nodeTitle} におすすめのリソースを追加
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              タイトル <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="記事のタイトル"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="https://example.com/article"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              種類
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Resource['type'])}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="article">記事</option>
              <option value="video">動画</option>
              <option value="course">コース</option>
              <option value="documentation">ドキュメント</option>
              <option value="paper">論文</option>
            </select>
          </div>


          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              追加
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

