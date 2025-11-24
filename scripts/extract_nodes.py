"""
data.tsからノード情報を抽出してJSON形式で出力するスクリプト
"""

import re
import json
import os

def extract_nodes_from_typescript(file_path: str) -> list:
    """
    TypeScriptのdata.tsファイルからノード情報を抽出
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    nodes = []
    
    # ノード定義を抽出（より柔軟なパターン）
    # { id: 'xxx', title: 'yyy', description: 'zzz', tier: 1, ... } の形式
    
    # ノード定義の開始位置を探す
    node_start_pattern = r'\{\s*id:\s*[\'"]([^\'"]+)[\'"]'
    
    matches = list(re.finditer(node_start_pattern, content))
    
    for i, match in enumerate(matches):
        start_pos = match.start()
        # 次のノードの開始位置、または配列の終了位置を探す
        if i + 1 < len(matches):
            end_pos = matches[i + 1].start()
        else:
            # 最後のノードの場合、次の } を探す
            end_pos = content.find('},', start_pos)
            if end_pos == -1:
                end_pos = content.find('}', start_pos)
        
        node_block = content[start_pos:end_pos]
        
        # 各フィールドを抽出
        id_match = re.search(r'id:\s*[\'"]([^\'"]+)[\'"]', node_block)
        title_match = re.search(r'title:\s*[\'"]([^\'"]+)[\'"]', node_block)
        desc_match = re.search(r'description:\s*[\'"]([^\'"]+)[\'"]', node_block)
        tier_match = re.search(r'tier:\s*(\d)', node_block)
        
        if id_match and title_match and tier_match:
            node_id = id_match.group(1)
            title = title_match.group(1)
            description = desc_match.group(1) if desc_match else ''
            tier = int(tier_match.group(1))
            
            nodes.append({
                'id': node_id,
                'title': title,
                'description': description,
                'tier': tier
            })
    
    return nodes


def main():
    """メイン処理"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(script_dir, '..', 'data.ts')
    
    if not os.path.exists(data_file):
        print(f"エラー: {data_file} が見つかりません")
        return
    
    print(f"data.tsからノードを抽出中...")
    nodes = extract_nodes_from_typescript(data_file)
    
    print(f"{len(nodes)}個のノードを抽出しました")
    
    # JSONファイルに保存
    output_file = os.path.join(script_dir, '..', 'data', 'nodes.json')
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(nodes, f, ensure_ascii=False, indent=2)
    
    print(f"ノードリストを {output_file} に保存しました")
    
    # 最初の5個を表示
    print("\n抽出されたノード（最初の5個）:")
    for node in nodes[:5]:
        print(f"  - {node['title']} (Tier {node['tier']})")


if __name__ == '__main__':
    main()

