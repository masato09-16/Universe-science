"""
data.tsからノードを読み込み、リソースを自動収集・要約して更新するスクリプト
"""

import json
import os
import sys
import time
import requests
from typing import List, Dict, Optional
from trafilatura import fetch_url, extract
from dotenv import load_dotenv

# Windowsでの文字コード問題を回避
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# 環境変数を読み込む
load_dotenv()

# API設定
SERPER_API_KEY = os.getenv('SERPER_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'openai')


def search_articles(query: str, num_results: int = 5) -> List[Dict[str, str]]:
    """Google検索で記事を検索"""
    if not SERPER_API_KEY:
        print(f"警告: SERPER_API_KEYが設定されていません。")
        return []
    
    url = "https://google.serper.dev/search"
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }
    payload = {
        'q': query,
        'num': num_results
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for item in data.get('organic', [])[:num_results]:
            results.append({
                'url': item.get('link', ''),
                'title': item.get('title', '')
            })
        return results
    except Exception as e:
        print(f"検索エラー ({query}): {e}")
        return []


def extract_article_content(url: str) -> Optional[str]:
    """URLから記事の本文を抽出"""
    try:
        downloaded = fetch_url(url)
        if downloaded:
            text = extract(downloaded, include_comments=False, include_tables=False)
            if text and len(text) > 200:
                return text
    except Exception as e:
        print(f"記事抽出エラー ({url}): {e}")
    return None


def summarize_with_openai(text: str, topic: str) -> Optional[str]:
    """OpenAI APIで要約"""
    if not OPENAI_API_KEY:
        return None
    
    try:
        import openai
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        
        prompt = f"""以下の記事を「{topic}」について初心者にわかりやすく3行で要約してください。
要約は日本語で、各文は簡潔にしてください。

記事内容:
{text[:8000]}
"""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "あなたは技術記事の要約を専門とするアシスタントです。"},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI要約エラー: {e}")
        return None


def summarize_with_gemini(text: str, topic: str) -> Optional[str]:
    """Gemini APIで要約"""
    if not GEMINI_API_KEY:
        return None
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""以下の記事を「{topic}」について初心者にわかりやすく3行で要約してください。
要約は日本語で、各文は簡潔にしてください。

記事内容:
{text[:8000]}
"""
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini要約エラー: {e}")
        return None


def summarize_article(text: str, topic: str) -> Optional[str]:
    """LLMで要約"""
    if LLM_PROVIDER == 'gemini':
        return summarize_with_gemini(text, topic)
    else:
        return summarize_with_openai(text, topic)


def process_topic(topic_title: str, topic_id: str) -> List[Dict[str, str]]:
    """単一トピックの記事を検索・抽出・要約"""
    print(f"\n処理中: {topic_title} ({topic_id})")
    
    query = f"{topic_title} 初心者 解説"
    articles = search_articles(query, num_results=3)
    
    if not articles:
        print(f"  → 検索結果が見つかりませんでした")
        return []
    
    resources = []
    
    for i, article in enumerate(articles, 1):
        print(f"  [{i}/{len(articles)}] {article['title']}")
        
        content = extract_article_content(article['url'])
        if not content:
            print(f"    → 記事の抽出に失敗しました")
            continue
        
        summary = summarize_article(content, topic_title)
        if not summary:
            print(f"    → 要約の生成に失敗しました")
            resources.append({
                'title': article['title'],
                'url': article['url'],
                'type': 'article',
                'summary': None
            })
            continue
        
        resources.append({
            'title': article['title'],
            'url': article['url'],
            'type': 'article',
            'summary': summary
        })
        
        print(f"    → 要約完了")
        time.sleep(2)
    
    return resources


def load_nodes_from_data_ts() -> List[Dict]:
    """data.tsからノード情報を読み込む"""
    import sys
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # まず、extract_nodes.pyでJSONを生成
    nodes_json_file = os.path.join(script_dir, '..', 'data', 'nodes.json')
    
    if os.path.exists(nodes_json_file):
        try:
            with open(nodes_json_file, 'r', encoding='utf-8') as f:
                nodes = json.load(f)
                print(f"✓ {len(nodes)}個のノードを読み込みました")
                return nodes
        except Exception as e:
            print(f"ノードJSONの読み込みエラー: {e}")
    
    # JSONファイルがない場合、簡易的なノードリストを返す
    print("警告: nodes.jsonが見つかりません。主要なノードのみ処理します。")
    print("先に 'python scripts/extract_nodes.py' を実行してください。")
    
    return [
        {'id': 'logistic-regression', 'title': 'ロジスティック回帰'},
        {'id': 'random-forest', 'title': 'ランダムフォレスト'},
        {'id': 'xgboost', 'title': 'XGBoost'},
        {'id': 'lightgbm', 'title': 'LightGBM'},
        {'id': 'cnn', 'title': 'CNN'},
        {'id': 'transformer', 'title': 'Transformer'},
        {'id': 'pandas', 'title': 'Pandas'},
        {'id': 'numpy', 'title': 'NumPy'},
        {'id': 'sklearn', 'title': 'Scikit-learn'},
    ]


def main():
    """メイン処理"""
    print("=" * 60)
    print("自動リソース収集・要約スクリプト")
    print("=" * 60)
    
    nodes = load_nodes_from_data_ts()
    all_resources = {}
    
    print(f"\n{len(nodes)}個のトピックを処理します...")
    
    for node in nodes:
        node_id = node.get('id')
        node_title = node.get('title')
        
        if not node_id or not node_title:
            continue
        
        resources = process_topic(node_title, node_id)
        
        if resources:
            all_resources[node_id] = resources
            print(f"✓ {node_title}: {len(resources)}件のリソースを取得")
        
        time.sleep(3)
    
    # JSONファイルに保存
    output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'resources.json')
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_resources, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ リソースデータを {output_file} に保存しました")


if __name__ == '__main__':
    main()

