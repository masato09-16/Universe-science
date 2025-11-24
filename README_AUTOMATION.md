# 自動リソース収集・要約システム

各単元のおすすめ記事を自動で収集し、LLMで要約するシステムです。

## セットアップ

### 1. 必要なAPIキーの取得

#### 🔍 Serper.dev API Key（Google検索用）

**取得方法：**
1. https://serper.dev/ にアクセス
2. 右上の「Sign Up」または「Login」をクリック
3. Googleアカウントでログイン（推奨）またはメールアドレスで登録
4. ログイン後、ダッシュボードに移動
5. 「API Keys」セクションで「Create API Key」をクリック
6. APIキーが生成されます（例：`abc123def456...`）
7. **無料プラン**: 月2,500リクエストまで無料

**APIキーの例：**
```
SERPER_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

#### 🤖 OpenAI API Key（要約用 - 推奨）

**取得方法：**
1. https://platform.openai.com/ にアクセス
2. 「Sign up」または「Log in」をクリック
3. アカウントを作成（メールアドレスまたはGoogleアカウント）
4. ログイン後、右上のプロフィールアイコンをクリック
5. 「View API keys」を選択
6. 「Create new secret key」をクリック
7. キー名を入力（例：「Data Science Knowledge」）
8. APIキーが表示されます（**この時だけ表示されるので必ずコピーしてください**）
9. **料金**: GPT-4o-miniは$0.15/1M入力トークン、$0.60/1M出力トークン（非常に安価）

**APIキーの例：**
```
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**注意**: APIキーは`sk-proj-`で始まります。

---

#### 🌟 Google Gemini API Key（要約用 - OpenAIの代替）

**取得方法：**
1. https://makersuite.google.com/app/apikey にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. プロジェクトを選択（または新規作成）
5. APIキーが生成されます
6. **無料プラン**: 月60リクエスト/分まで無料

**APIキーの例：**
```
GEMINI_API_KEY=AIzaSyAbc123Def456Ghi789Jkl012Mno345Pqr678
```

---

### 2. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、取得したAPIキーを貼り付けます。

#### ステップ1: .envファイルを作成

**方法1: テンプレートファイルをコピー（推奨・簡単）**

プロジェクトルートにある`env.template`ファイルを`.env`にコピーします：

**Windows (PowerShell):**
```powershell
Copy-Item env.template .env
```

**Windows (コマンドプロンプト):**
```cmd
copy env.template .env
```

**Mac/Linux:**
```bash
cp env.template .env
```

**方法2: 手動で作成**

プロジェクトのルートディレクトリ（`package.json`がある場所）で、以下のコマンドを実行：

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**Windows (コマンドプロンプト):**
```cmd
type nul > .env
```

**Mac/Linux:**
```bash
touch .env
```

または、エディタで直接`.env`という名前のファイルを作成してください。

#### ステップ2: .envファイルを編集してAPIキーを貼り付け

**OpenAIを使用する場合（推奨）:**
```env
# Serper.dev API Key（Google検索用）
# 取得: https://serper.dev/
SERPER_API_KEY=ここにSerper.devのAPIキーを貼り付け

# OpenAI API Key（要約用）
# 取得: https://platform.openai.com/api-keys
OPENAI_API_KEY=ここにOpenAIのAPIキーを貼り付け

# 使用するLLMプロバイダー
LLM_PROVIDER=openai
```

**Geminiを使用する場合:**
```env
# Serper.dev API Key（Google検索用）
# 取得: https://serper.dev/
SERPER_API_KEY=ここにSerper.devのAPIキーを貼り付け

# Google Gemini API Key（要約用）
# 取得: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=ここにGeminiのAPIキーを貼り付け

# 使用するLLMプロバイダー
LLM_PROVIDER=gemini
```

#### ステップ3: APIキーを実際の値に置き換え

`.env`ファイルを開き、`ここに...を貼り付け`の部分を実際のAPIキーに置き換えてください。

**例（OpenAI使用時）:**
```env
SERPER_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
LLM_PROVIDER=openai
```

**⚠️ 重要**: 
- `.env`ファイルは**絶対にGitにコミットしないでください**（既に`.gitignore`に含まれています）
- APIキーは他人に見せないでください
- もしAPIキーを公開してしまった場合は、すぐに再生成してください

---

### 3. Python依存関係のインストール

Python 3.8以上が必要です。以下のコマンドで依存関係をインストールします：

```bash
pip install -r requirements.txt
```

**エラーが出る場合:**
```bash
pip3 install -r requirements.txt
```

または

```bash
python -m pip install -r requirements.txt
```

---

## 使用方法

### ステップ1: ノード情報の抽出（初回のみ）

`data.ts`からノード情報をJSON形式で抽出します：

```bash
python scripts/extract_nodes.py
```

これにより、`data/nodes.json`が生成されます。

**エラーが出る場合:**
```bash
python3 scripts/extract_nodes.py
```

### ステップ2: リソースの自動収集・要約

```bash
python scripts/load_and_update_resources.py
```

このスクリプトは：
1. `data/nodes.json`からノード情報を読み込み（なければ主要なノードのみ処理）
2. 各トピックについてGoogle検索で関連記事を検索
3. 記事の本文を抽出
4. LLMで要約を生成
5. `data/resources.json`に保存

**処理時間**: 1トピックあたり約10-20秒かかります。10個のトピックで約2-3分程度です。

**エラーが出る場合:**
```bash
python3 scripts/load_and_update_resources.py
```

---

## 出力ファイル

`data/resources.json`に以下の形式で保存されます：

```json
{
  "logistic-regression": [
    {
      "title": "ロジスティック回帰の完全ガイド",
      "url": "https://example.com/article",
      "type": "article",
      "summary": "ロジスティック回帰は、分類問題を解決するための統計的手法です。\n確率を出力し、閾値を使ってクラスに分類します。\nシンプルで解釈しやすく、多くの実務で使用されています。"
    }
  ]
}
```

---

## フロントエンドでの表示

自動収集されたリソースは、`/api/resources`エンドポイント経由で読み込まれ、各ノードの詳細ページに表示されます。

要約があるリソースは、URLの下に要約テキストが表示されます。

---

## トラブルシューティング

### APIキーが認識されない

- `.env`ファイルがプロジェクトルートにあるか確認
- `.env`ファイルの構文が正しいか確認（`=`の前後にスペースを入れない）
- アプリを再起動

### 検索結果が取得できない

- Serper.devのAPIキーが正しいか確認
- 無料プランの制限（月2,500リクエスト）を超えていないか確認
- インターネット接続を確認

### 要約が生成されない

- OpenAIまたはGeminiのAPIキーが正しいか確認
- APIのクレジット残高を確認
- `LLM_PROVIDER`が正しく設定されているか確認（`openai`または`gemini`）

### 記事の抽出に失敗する

- 一部のサイトはアクセス制限があるため、正常な動作です
- スクリプトは自動的に次の記事に進みます

---

## 注意事項

- **APIのレート制限**: 各APIにはレート制限があります。大量のトピックを処理する場合は、時間をかけて実行してください
- **コスト**: OpenAI APIは使用量に応じて課金されます。GPT-4o-miniは非常に安価ですが、大量に使用する場合は注意してください
- **処理時間**: 1トピックあたり約10-20秒かかります。100個のトピックを処理する場合、約20-30分かかります
- **記事の抽出**: 一部のサイトはアクセス制限やJavaScriptが必要なため、抽出に失敗する場合があります

---

## よくある質問

**Q: 無料で使えますか？**
A: Serper.devとGeminiは無料プランがあります。OpenAIは使用量に応じて課金されますが、GPT-4o-miniは非常に安価です。

**Q: どのLLMを使うべきですか？**
A: OpenAI GPT-4o-miniが推奨です。品質が高く、コストも低いです。Geminiは無料ですが、品質はやや劣る場合があります。

**Q: 処理を中断できますか？**
A: はい、Ctrl+Cで中断できます。既に処理されたトピックは`data/resources.json`に保存されています。

**Q: 再度実行するとどうなりますか？**
A: 既存のリソースに追加されます。同じトピックのリソースは上書きされません。
