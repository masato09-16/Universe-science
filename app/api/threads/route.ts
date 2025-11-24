import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs';
import path from 'path';

const THREADS_FILE = path.join(process.cwd(), 'data', 'threads.json');
const BOOKMARKS_FILE = path.join(process.cwd(), 'data', 'user-bookmarks.json');

export interface Post {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: string;
  threadId: string;
}

export interface Thread {
  id: string;
  title: string;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  postCount: number;
  posts: Post[];
  likes?: number;
  likedBy?: string[]; // いいねしたユーザーIDのリスト
  tags?: string[]; // タグ（ノードIDの配列）
}

// スレッドを読み込む
function loadThreads(): Thread[] {
  try {
    if (fs.existsSync(THREADS_FILE)) {
      const content = fs.readFileSync(THREADS_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading threads:', error);
  }
  return [];
}

// スレッドを保存する
function saveThreads(threads: Thread[]) {
  try {
    const dir = path.dirname(THREADS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(THREADS_FILE, JSON.stringify(threads, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving threads:', error);
  }
}

// ブックマークを読み込む
function loadBookmarks(): Record<string, string[]> {
  try {
    if (fs.existsSync(BOOKMARKS_FILE)) {
      const content = fs.readFileSync(BOOKMARKS_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading bookmarks:', error);
  }
  return {};
}

// ブックマークを保存する
function saveBookmarks(bookmarks: Record<string, string[]>) {
  try {
    const dir = path.dirname(BOOKMARKS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving bookmarks:', error);
  }
}

// スレッド一覧を取得
export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || session?.user?.email || null;
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const action = searchParams.get('action'); // 'bookmarks' でブックマーク一覧を取得
    const tag = searchParams.get('tag'); // タグで検索

    const threads = loadThreads();
    const bookmarks = loadBookmarks();

    if (action === 'bookmarks') {
      // ブックマーク一覧を取得
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const userBookmarks = bookmarks[userId] || [];
      const bookmarkedThreads = threads
        .filter(thread => userBookmarks.includes(thread.id))
        .map(thread => ({
          id: thread.id,
          title: thread.title,
          author: thread.author,
          authorId: thread.authorId,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          postCount: thread.postCount,
          likes: thread.likes || 0,
          isLiked: userId && (thread.likedBy || []).includes(userId),
          isBookmarked: true,
        }))
        .sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      return NextResponse.json(bookmarkedThreads);
    }

    if (threadId) {
      // 特定のスレッドを取得
      const thread = threads.find(t => t.id === threadId);
      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
      }
      const userBookmarks = userId ? (bookmarks[userId] || []) : [];
      return NextResponse.json({
        ...thread,
        likes: thread.likes || 0,
        isLiked: userId ? ((thread.likedBy || []).includes(userId)) : false,
        isBookmarked: userBookmarks.includes(threadId),
        tags: thread.tags || [],
      });
    } else {
      // スレッド一覧を取得（投稿数順、更新日時順）
      const userBookmarks = userId ? (bookmarks[userId] || []) : [];
      let filteredThreads = threads;
      
      // タグでフィルタリング
      if (tag) {
        filteredThreads = threads.filter(thread => 
          thread.tags && thread.tags.includes(tag)
        );
      }
      
      const sortedThreads = filteredThreads
        .map(thread => ({
          id: thread.id,
          title: thread.title,
          author: thread.author,
          authorId: thread.authorId,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          postCount: thread.postCount,
          likes: thread.likes || 0,
          isLiked: userId ? ((thread.likedBy || []).includes(userId)) : false,
          isBookmarked: userBookmarks.includes(thread.id),
          tags: thread.tags || [],
        }))
        .sort((a, b) => {
          // 更新日時が新しい順
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      return NextResponse.json(sortedThreads);
    }
  } catch (error) {
    console.error('Error reading threads:', error);
    return NextResponse.json({ error: 'Failed to load threads' }, { status: 500 });
  }
}

// スレッドを作成
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, threadId, action, tags } = body; // action: 'like', 'unlike', 'bookmark', 'unbookmark'

    const threads = loadThreads();
    const userId = session.user?.id || session.user?.email || 'anonymous';
    const userName = session.user?.name || session.user?.email || '匿名ユーザー';
    const now = new Date().toISOString();

    if (action === 'like' || action === 'unlike') {
      // いいねの追加/削除
      if (!threadId) {
        return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
      }

      const thread = threads.find(t => t.id === threadId);
      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
      }

      // 初期化
      if (!thread.likedBy) {
        thread.likedBy = [];
      }
      if (thread.likes === undefined) {
        thread.likes = 0;
      }

      const isLiked = thread.likedBy.includes(userId);

      if (action === 'like' && !isLiked) {
        thread.likedBy.push(userId);
        thread.likes = (thread.likes || 0) + 1;
      } else if (action === 'unlike' && isLiked) {
        thread.likedBy = thread.likedBy.filter(id => id !== userId);
        thread.likes = Math.max(0, (thread.likes || 0) - 1);
      }

      saveThreads(threads);
      return NextResponse.json({ 
        success: true, 
        likes: thread.likes,
        isLiked: thread.likedBy.includes(userId),
      });
    } else if (action === 'bookmark' || action === 'unbookmark') {
      // ブックマークの追加/削除
      if (!threadId) {
        return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
      }

      const thread = threads.find(t => t.id === threadId);
      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
      }

      const bookmarks = loadBookmarks();
      if (!bookmarks[userId]) {
        bookmarks[userId] = [];
      }

      const isBookmarked = bookmarks[userId].includes(threadId);

      if (action === 'bookmark' && !isBookmarked) {
        bookmarks[userId].push(threadId);
      } else if (action === 'unbookmark' && isBookmarked) {
        bookmarks[userId] = bookmarks[userId].filter(id => id !== threadId);
      }

      saveBookmarks(bookmarks);
      return NextResponse.json({ 
        success: true, 
        isBookmarked: bookmarks[userId].includes(threadId),
      });
    } else if (threadId && content) {
      // 既存のスレッドに投稿を追加
      const thread = threads.find(t => t.id === threadId);
      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
      }

      const post: Post = {
        id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        author: userName,
        authorId: userId,
        content: content,
        createdAt: now,
        threadId: threadId,
      };

      thread.posts.push(post);
      thread.postCount = thread.posts.length;
      thread.updatedAt = now;

      saveThreads(threads);
      return NextResponse.json({ success: true, post });
    } else if (title && content) {
      // 新しいスレッドを作成
      if (!title || !content) {
        return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
      }

      const newThreadId = `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const firstPost: Post = {
        id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        author: userName,
        authorId: userId,
        content: content,
        createdAt: now,
        threadId: newThreadId,
      };

      const newThread: Thread = {
        id: newThreadId,
        title: title,
        author: userName,
        authorId: userId,
        createdAt: now,
        updatedAt: now,
        postCount: 1,
        posts: [firstPost],
        likes: 0,
        likedBy: [],
        tags: tags || [],
      };

      threads.push(newThread);
      saveThreads(threads);

      return NextResponse.json({ success: true, thread: newThread });
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating thread/post:', error);
    return NextResponse.json({ error: 'Failed to create thread/post' }, { status: 500 });
  }
}

