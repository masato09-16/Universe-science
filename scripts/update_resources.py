"""
自動リソース収集・要約スクリプト

各単元について、Google検索で関連記事を収集し、LLMで要約してdata.jsonに保存します。
"""

import json
import os
import time
import requests
from typing import List, Dict, Optional
from trafilatura import fetch_url, extract
import openai
from dotenv import load_dotenv

# 環境変数を読み込む
load_dotenv()

# API設定
SERPER_API_KEY = os.getenv('SERPER_API_KEY')  # Serper.dev API key
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')  # OpenAI API key
# または Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')  # Google Gemini API key

# 使用するLLM（'openai' または 'gemini'）
LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'openai')


def search_articles(query: str, num_results: int = 5) -> List[Dict[str, str]]:
    """
    Google検索で記事を検索し、URLとタイトルを取得
    
    Args:
        query: 検索クエリ（例：「ロジスティック回帰 初心者」）
        num_results: 取得する結果数
    
    Returns:
        [{'url': '...', 'title': '...'}, ...]
    """
    if not SERPER_API_KEY:
        print(f"警告: SERPER_API_KEYが設定されていません。{query}の検索をスキップします。")
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
    """
    URLから記事の本文を抽出
    
    Args:
        url: 記事のURL
    
    Returns:
        記事の本文テキスト（抽出失敗時はNone）
    """
    try:
        downloaded = fetch_url(url, timeout=10)
        if downloaded:
            text = extract(downloaded, include_comments=False, include_tables=False)
            if text and len(text) > 200:  # 最低200文字以上
                return text
    except Exception as e:
        print(f"記事抽出エラー ({url}): {e}")
    
    return None


def summarize_with_openai(text: str, topic: str) -> Optional[str]:
    """
    OpenAI APIを使用して記事を要約
    
    Args:
        text: 記事の本文
        topic: トピック名（例：「ロジスティック回帰」）
    
    Returns:
        3行の要約テキスト
    """
    if not OPENAI_API_KEY:
        return None
    
    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        
        prompt = f"""以下の記事を「{topic}」について初心者にわかりやすく3行で要約してください。
要約は日本語で、各文は簡潔にしてください。

記事内容:
{text[:8000]}  # トークン制限のため最初の8000文字のみ
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
        
        summary = response.choices[0].message.content.strip()
        return summary
    except Exception as e:
        print(f"OpenAI要約エラー: {e}")
        return None


def summarize_with_gemini(text: str, topic: str) -> Optional[str]:
    """
    Gemini APIを使用して記事を要約
    
    Args:
        text: 記事の本文
        topic: トピック名
    
    Returns:
        3行の要約テキスト
    """
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
        summary = response.text.strip()
        return summary
    except Exception as e:
        print(f"Gemini要約エラー: {e}")
        return None


def summarize_article(text: str, topic: str) -> Optional[str]:
    """
    LLMを使用して記事を要約（プロバイダーに応じて切り替え）
    """
    if LLM_PROVIDER == 'gemini':
        return summarize_with_gemini(text, topic)
    else:
        return summarize_with_openai(text, topic)


def process_topic(topic_title: str, topic_id: str) -> List[Dict[str, str]]:
    """
    単一のトピックについて、記事を検索・抽出・要約する
    
    Args:
        topic_title: トピックのタイトル（例：「ロジスティック回帰」）
        topic_id: トピックのID
    
    Returns:
        リソースのリスト（URL、タイトル、要約を含む）
    """
    print(f"\n処理中: {topic_title} ({topic_id})")
    
    # 検索クエリを生成（日本語で検索）
    query = f"{topic_title} 初心者 解説"
    
    # 記事を検索
    articles = search_articles(query, num_results=3)
    if not articles:
        print(f"  → 検索結果が見つかりませんでした")
        return []
    
    resources = []
    
    for i, article in enumerate(articles, 1):
        print(f"  [{i}/{len(articles)}] {article['title']}")
        
        # 記事の本文を抽出
        content = extract_article_content(article['url'])
        if not content:
            print(f"    → 記事の抽出に失敗しました")
            continue
        
        # 要約を生成
        summary = summarize_article(content, topic_title)
        if not summary:
            print(f"    → 要約の生成に失敗しました")
            # 要約が失敗してもURLは保存
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
        
        # APIレート制限を避けるため、少し待機
        time.sleep(2)
    
    return resources


def load_existing_data(data_file: str) -> Dict:
    """
    既存のdata.tsファイルを読み込む（JSONとして解析）
    """
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            content = f.read()
            # TypeScriptのexport文を除去してJSONとして解析
            # 簡易的な処理（実際のファイル構造に応じて調整が必要）
            # ここでは、nodesとlinksの部分を抽出する必要がある
            # 実際の実装では、より堅牢なパースが必要
            return {'nodes': [], 'links': []}
    except Exception as e:
        print(f"データファイルの読み込みエラー: {e}")
        return {'nodes': [], 'links': []}


def update_resources_for_all_topics(nodes: List[Dict], output_file: str = 'data/resources.json'):
    """
    すべてのトピックについてリソースを更新
    
    Args:
        nodes: ノードのリスト
        output_file: 出力ファイルのパス
    """
    all_resources = {}
    
    # 各ノードについて処理
    for node in nodes:
        node_id = node.get('id')
        node_title = node.get('title')
        
        if not node_id or not node_title:
            continue
        
        # リソースを取得
        resources = process_topic(node_title, node_id)
        
        if resources:
            all_resources[node_id] = resources
            print(f"✓ {node_title}: {len(resources)}件のリソースを取得")
        
        # レート制限を避けるため、トピック間で待機
        time.sleep(3)
    
    # JSONファイルに保存
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_resources, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ リソースデータを {output_file} に保存しました")


def main():
    """
    メイン処理
    """
    print("=" * 60)
    print("自動リソース収集・要約スクリプト")
    print("=" * 60)
    
    # data.tsからノードを読み込む（簡易版）
    # 実際には、TypeScriptファイルをパースするか、JSON形式でエクスポートする必要がある
    # ここでは、手動でノードリストを定義するか、別の方法で読み込む
    
    # 例：主要なトピックのみ処理する場合
    important_topics = [
        {'id': 'logistic-regression', 'title': 'ロジスティック回帰'},
        {'id': 'random-forest', 'title': 'ランダムフォレスト'},
        {'id': 'xgboost', 'title': 'XGBoost'},
        {'id': 'lightgbm', 'title': 'LightGBM'},
        {'id': 'cnn', 'title': 'CNN'},
        {'id': 'transformer', 'title': 'Transformer'},
    ]
    
    print(f"\n{len(important_topics)}個のトピックを処理します...")
    
    update_resources_for_all_topics(important_topics)
    
    print("\n処理完了！")


if __name__ == '__main__':
    main()

