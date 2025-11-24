"""
data.tsからノード情報をJSON形式でエクスポートするスクリプト
"""

import re
import json
import sys
import os

def parse_typescript_nodes(file_path: str) -> list:
    """
    TypeScriptのdata.tsファイルからノード情報を抽出
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    nodes = []
    
    # ノード定義を抽出（簡易的な正規表現パース）
    # より堅牢な実装には、TypeScriptパーサーを使用することを推奨
    node_pattern = r'\{[^}]*id:\s*[\'"]([^\'"]+)[\'"][^}]*title:\s*[\'"]([^\'"]+)[\'"][^}]*tier:\s*(\d)[^}]*\}'
    
    # より詳細なパース（generateResources呼び出しを考慮）
    # 実際の実装では、ASTパーサーを使用する方が安全
    
    # 簡易版：手動でノードを抽出
    # 実際のファイル構造に応じて調整が必要
    
    return nodes


def main():
    """
    data.tsを読み込んで、ノードリストをJSONで出力
    """
    data_file = os.path.join(os.path.dirname(__file__), '..', 'data.ts')
    
    if not os.path.exists(data_file):
        print(f"エラー: {data_file} が見つかりません")
        sys.exit(1)
    
    # ここでは、手動でノードIDとタイトルのリストを作成
    # 実際の実装では、TypeScriptパーサーを使用
    
    print("注意: このスクリプトは簡易版です。")
    print("実際の実装では、TypeScriptパーサーを使用してdata.tsを解析してください。")
    
    # 出力例
    nodes = [
        {'id': 'logistic-regression', 'title': 'ロジスティック回帰'},
        {'id': 'random-forest', 'title': 'ランダムフォレスト'},
        # ... 他のノード
    ]
    
    output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'nodes.json')
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(nodes, f, ensure_ascii=False, indent=2)
    
    print(f"ノードリストを {output_file} に保存しました")


if __name__ == '__main__':
    main()

