'use client';

/**
 * CommunityFeed Component
 * 
 * Social feed where users can see achievements and milestones from other players
 * Encourages social interaction and competition
 */

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/client';

interface Post {
  id: string;
  userId: string;
  username?: string;
  isAdmin?: boolean;
  content: string;
  likes: number;
  type: 'text' | 'achievement' | 'milestone';
  metadata?: string;
  createdAt: string;
  isLiked?: boolean;
}

export default function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await apiFetch<{ posts: Post[] }>('/community/feed');
      setPosts(data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.trim() || posting) return;

    setPosting(true);
    try {
      await apiFetch('/community/post', {
        method: 'POST',
        body: JSON.stringify({ content: newPost, type: 'text' }),
      });
      setNewPost('');
      fetchPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setPosting(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      const response = await apiFetch<{ success: boolean; action: string }>('/community/like', {
        method: 'POST',
        body: JSON.stringify({ postId }),
      });
      
      // Optimistically update the UI
      setPosts(posts.map(post => {
        if (post.id === postId) {
          if (response.action === 'liked') {
            return { ...post, likes: post.likes + 1, isLiked: true };
          } else {
            return { ...post, likes: Math.max(0, post.likes - 1), isLiked: false };
          }
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to like post:', error);
      // Refresh on error to get correct state
      fetchPosts();
    }
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'milestone': return '🎯';
      default: return '💬';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        🌍 Community Feed
      </h2>

      {/* Create Post */}
      <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts with the community..."
          maxLength={280}
          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
          rows={3}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {newPost.length}/280
          </span>
          <button
            onClick={createPost}
            disabled={!newPost.trim() || posting}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">🌟</div>
            <p>No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className={`rounded-lg p-4 hover:shadow-md transition-shadow border ${
                post.isAdmin
                  ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-amber-900/20 border-amber-300 dark:border-amber-600'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                  post.isAdmin
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 ring-2 ring-amber-400'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                  {post.isAdmin ? '👑' : (post.username || 'U')[0].toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-gray-800 dark:text-white">
                      {post.username || 'Anonymous'}
                    </span>
                    {post.isAdmin && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                        ADMIN
                      </span>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getTimeAgo(post.createdAt)}
                    </span>
                    <span className="text-lg">{getPostIcon(post.type)}</span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-3 break-words">
                    {post.content}
                  </p>

                  {/* Metadata for special posts */}
                  {post.metadata && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 border border-gray-200 dark:border-gray-600">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {JSON.parse(post.metadata).description || ''}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => likePost(post.id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        post.isLiked
                          ? 'text-red-500'
                          : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <span className="text-lg">{post.isLiked ? '❤️' : '🤍'}</span>
                      <span className="font-medium">{post.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
