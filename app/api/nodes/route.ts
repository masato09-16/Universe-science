import { NextResponse } from 'next/server';
import { nodes } from '@/data';

// ノード一覧を取得（タグ候補として使用）
export async function GET() {
  try {
    // ノードを階層ごとに整理
    const nodesByTier = {
      tier1: nodes.filter(n => n.tier === 1),
      tier2: nodes.filter(n => n.tier === 2),
      tier3: nodes.filter(n => n.tier === 3),
    };

    return NextResponse.json({
      all: nodes.map(node => ({
        id: node.id,
        title: node.title,
        tier: node.tier,
      })),
      byTier: {
        tier1: nodesByTier.tier1.map(node => ({
          id: node.id,
          title: node.title,
          tier: node.tier,
        })),
        tier2: nodesByTier.tier2.map(node => ({
          id: node.id,
          title: node.title,
          tier: node.tier,
        })),
        tier3: nodesByTier.tier3.map(node => ({
          id: node.id,
          title: node.title,
          tier: node.tier,
        })),
      },
    });
  } catch (error) {
    console.error('Error loading nodes:', error);
    return NextResponse.json({ error: 'Failed to load nodes' }, { status: 500 });
  }
}

