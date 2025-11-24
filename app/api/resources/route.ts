import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs';
import path from 'path';

const RESOURCES_FILE = path.join(process.cwd(), 'data', 'resources.json');
const USER_RESOURCES_FILE = path.join(process.cwd(), 'data', 'user-resources.json');

// ユーザーリソースを読み込む
function loadUserResources(): Record<string, any[]> {
  try {
    if (fs.existsSync(USER_RESOURCES_FILE)) {
      const content = fs.readFileSync(USER_RESOURCES_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading user resources:', error);
  }
  return {};
}

// ユーザーリソースを保存する
function saveUserResources(data: Record<string, any[]>) {
  try {
    const dir = path.dirname(USER_RESOURCES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USER_RESOURCES_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving user resources:', error);
  }
}

// 自動収集リソースを読み込む
function loadAutoResources(): Record<string, any[]> {
  try {
    if (fs.existsSync(RESOURCES_FILE)) {
      const content = fs.readFileSync(RESOURCES_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading auto resources:', error);
  }
  return {};
}

export async function GET() {
  try {
    const autoResources = loadAutoResources();
    const userResources = loadUserResources();
    
    // 自動収集リソースとユーザーリソースをマージ
    const allResources: Record<string, any[]> = {};
    
    // すべてのノードIDを収集
    const allNodeIds = new Set([
      ...Object.keys(autoResources),
      ...Object.keys(userResources)
    ]);
    
    allNodeIds.forEach(nodeId => {
      const auto = autoResources[nodeId] || [];
      const user = userResources[nodeId] || [];
      
      // URLをキーにしてリソースをマージ
      const resourceMap = new Map<string, any>();
      
      // まず自動収集リソースを追加
      auto.forEach((resource: any) => {
        resourceMap.set(resource.url, { ...resource });
      });
      
      // ユーザーリソースで上書き（評価など）
      user.forEach((resource: any) => {
        const existing = resourceMap.get(resource.url);
        if (existing) {
          // 既存のリソースに評価をマージ
          const mergedRatings = [...(existing.ratings || []), ...(resource.ratings || [])];
          // 同じユーザーの重複を削除（最新の評価を保持）
          const uniqueRatings = Array.from(
            new Map(mergedRatings.map((r: any) => [r.userId, r])).values()
          );
          
          resourceMap.set(resource.url, {
            ...existing,
            ratings: uniqueRatings,
            userAdded: resource.userAdded !== undefined ? resource.userAdded : existing.userAdded,
          });
        } else {
          // 新規のユーザー追加リソース
          resourceMap.set(resource.url, resource);
        }
      });
      
      allResources[nodeId] = Array.from(resourceMap.values());
    });
    
    return NextResponse.json(allResources);
  } catch (error) {
    console.error('Error reading resources:', error);
    return NextResponse.json({ error: 'Failed to load resources' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nodeId, resource, action } = body;

    if (!nodeId || !resource) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userResources = loadUserResources();

    if (action === 'add') {
      // リソースを追加
      if (!userResources[nodeId]) {
        userResources[nodeId] = [];
      }
      
      // 重複チェック
      const exists = userResources[nodeId].some((r: any) => r.url === resource.url);
      if (!exists) {
        userResources[nodeId].push(resource);
        saveUserResources(userResources);
      }
    } else if (action === 'update') {
      // リソースを更新（評価など）
      if (!userResources[nodeId]) {
        userResources[nodeId] = [];
      }
      
      // 既存のリソースを探す
      const index = userResources[nodeId].findIndex((r: any) => r.url === resource.url);
      
      // セッションからユーザー情報を取得
      const userId = session.user?.id || session.user?.email || 'anonymous';
      const userName = session.user?.name || session.user?.email || '匿名ユーザー';
      
      const newRating = {
        userId,
        userName,
        rating: resource.rating,
        ratedAt: new Date().toISOString(),
      };
      
      if (index >= 0) {
        // 既存のリソースを更新
        const existing = userResources[nodeId][index];
        const ratings = existing.ratings || [];
        
        // 同じユーザーの既存の評価を探す
        const userRatingIndex = ratings.findIndex((r: any) => r.userId === userId);
        
        if (userRatingIndex >= 0) {
          // 既存の評価を更新
          if (resource.rating === 0) {
            // 評価が0の場合は削除
            ratings.splice(userRatingIndex, 1);
          } else {
            ratings[userRatingIndex] = newRating;
          }
        } else {
          // 新しい評価を追加
          if (resource.rating > 0) {
            ratings.push(newRating);
          }
        }
        
        userResources[nodeId][index] = {
          ...existing,
          ratings,
        };
      } else {
        // 自動収集リソースの評価を更新する場合は、最小限の情報でユーザーリソースに保存
        const autoResources = loadAutoResources();
        const autoResource = (autoResources[nodeId] || []).find((r: any) => r.url === resource.url);
        
        const ratings = resource.rating > 0 ? [newRating] : [];
        
        if (autoResource) {
          // 自動収集リソースの情報をコピーして、評価を追加
          userResources[nodeId].push({
            ...autoResource,
            ratings,
            userAdded: false,
          });
        } else {
          // 自動収集リソースにない場合は、提供されたリソース情報を使用
          userResources[nodeId].push({
            url: resource.url,
            ratings,
            userAdded: false,
          });
        }
      }
      saveUserResources(userResources);
    } else if (action === 'remove') {
      // リソースを削除
      if (userResources[nodeId]) {
        userResources[nodeId] = userResources[nodeId].filter(
          (r: any) => r.url !== resource.url
        );
        saveUserResources(userResources);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating resources:', error);
    return NextResponse.json({ error: 'Failed to update resources' }, { status: 500 });
  }
}
