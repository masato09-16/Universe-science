'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Star, ExternalLink } from 'lucide-react';
import { Resource } from '@/data';

interface ResourceCardProps {
  resource: Resource;
  onRate: (url: string, rating: number) => void;
  onRemove?: (url: string) => void;
}

export default function ResourceCard({ resource, onRate, onRemove }: ResourceCardProps) {
  const { data: session } = useSession();
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  
  // 現在のユーザーの評価を取得
  const getCurrentUserRating = (): number => {
    if (!session?.user) return 0;
    const userId = session.user.id || session.user.email;
    if (resource.ratings) {
      const userRating = resource.ratings.find(r => r.userId === userId);
      return userRating?.rating || 0;
    }
    return resource.rating || 0;
  };

  const [currentRating, setCurrentRating] = useState<number>(getCurrentUserRating());

  // リソースが変更されたら評価を更新
  useEffect(() => {
    setCurrentRating(getCurrentUserRating());
  }, [resource, session]);

  // 平均評価を計算
  const averageRating = resource.ratings && resource.ratings.length > 0
    ? resource.ratings.reduce((acc, r) => acc + r.rating, 0) / resource.ratings.length
    : resource.rating || 0;
  
  const ratingCount = resource.ratings?.length || 0;

  const handleRatingClick = (rating: number) => {
    if (!session) {
      alert('評価するにはログインが必要です');
      return;
    }
    const newRating = currentRating === rating ? 0 : rating; // 同じ評価をクリックしたら削除
    setCurrentRating(newRating);
    onRate(resource.url, newRating);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      article: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      video: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      course: 'bg-green-500/20 text-green-300 border-green-500/50',
      documentation: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      paper: 'bg-red-500/20 text-red-300 border-red-500/50',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  };

  const displayRating = hoveredRating !== null ? hoveredRating : currentRating;

  return (
    <div className="p-5 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-medium hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              {resource.title}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-sm text-cyan-400 break-all mb-2">{resource.url}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-block px-2 py-1 text-xs rounded border ${getTypeColor(resource.type)}`}>
              {resource.type}
            </span>
            {resource.userAdded && (
              <span className="inline-block px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 rounded">
                ユーザー追加
              </span>
            )}
          </div>
        </div>
        {onRemove && (
          <button
            onClick={() => onRemove(resource.url)}
            className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
            title="削除"
          >
            ×
          </button>
        )}
      </div>

      {resource.summary && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {resource.summary}
          </p>
        </div>
      )}

      {/* 評価UI */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="space-y-2">
          {/* あなたの評価 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">あなたの評価:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingClick(rating)}
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="transition-colors"
                  title={`${rating}つ星`}
                  disabled={!session}
                >
                  <Star
                    className={`w-5 h-5 ${
                      rating <= displayRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-500 hover:text-yellow-400'
                    } ${!session ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </button>
              ))}
            </div>
            {currentRating > 0 && (
              <span className="text-sm text-cyan-400 ml-2 font-medium">
                ({currentRating}/5)
              </span>
            )}
            {currentRating === 0 && session && (
              <span className="text-xs text-gray-500 ml-2">評価してください</span>
            )}
            {!session && (
              <span className="text-xs text-gray-500 ml-2">ログインが必要です</span>
            )}
          </div>
          
          {/* 平均評価 */}
          {ratingCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">平均評価:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`w-4 h-4 ${
                      rating <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-300 ml-2">
                {averageRating.toFixed(1)}/5 ({ratingCount}件の評価)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
