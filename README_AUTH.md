# Google認証のセットアップ

リソースを追加するには、Googleアカウントでのログインが必要です。

## セットアップ手順

### 1. Google Cloud ConsoleでOAuth認証情報を作成

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/ にアクセス
   - Googleアカウントでログイン

2. **プロジェクトを作成（または既存のプロジェクトを選択）**
   - 上部のプロジェクト選択ドロップダウンをクリック
   - 「新しいプロジェクト」をクリック
   - プロジェクト名を入力（例：「Data Science Knowledge」）
   - 「作成」をクリック

3. **OAuth同意画面を設定**
   - 左メニューから「APIとサービス」→「OAuth同意画面」を選択
   - ユーザータイプを選択（外部または内部）
   - アプリ名を入力（例：「Data Science Knowledge」）
   - ユーザーサポートメールを選択
   - デベロッパーの連絡先情報を入力
   - 「保存して次へ」をクリック
   - スコープはそのまま「保存して次へ」
   - テストユーザー（必要に応じて）を追加
   - 「ダッシュボードに戻る」をクリック

4. **OAuth 2.0 クライアント IDを作成**
   - 左メニューから「APIとサービス」→「認証情報」を選択
   - 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
   - アプリケーションの種類: 「ウェブアプリケーション」を選択
   - 名前: 任意の名前（例：「Data Science Knowledge Web Client」）
   - **承認済みのリダイレクト URI**を追加:
     - 開発環境: `http://localhost:3000/api/auth/callback/google`
     - 本番環境: `https://yourdomain.com/api/auth/callback/google`
   - 「作成」をクリック
   - **クライアントID**と**クライアントシークレット**が表示されます（この時だけ表示されるので必ずコピーしてください）

### 2. NextAuth.jsのシークレットキーを生成

以下のいずれかの方法でシークレットキーを生成してください：

**方法1: OpenSSLを使用（推奨）**
```bash
openssl rand -base64 32
```

**方法2: オンラインツールを使用**
- https://generate-secret.vercel.app/32 にアクセス
- 生成されたキーをコピー

**方法3: Node.jsを使用**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. 環境変数を設定

`.env`ファイルに以下を追加：

```env
# NextAuth.jsのシークレットキー
NEXTAUTH_SECRET=生成したシークレットキーを貼り付け

# Google OAuth設定
GOOGLE_CLIENT_ID=Google Cloud Consoleで取得したクライアントIDを貼り付け
GOOGLE_CLIENT_SECRET=Google Cloud Consoleで取得したクライアントシークレットを貼り付け

# NextAuth.jsのURL
NEXTAUTH_URL=http://localhost:3000
```

**本番環境の場合:**
```env
NEXTAUTH_URL=https://yourdomain.com
```

### 4. アプリを再起動

環境変数を変更したら、開発サーバーを再起動してください：

```bash
npm run dev
```

## 使用方法

1. **ログイン**
   - サイドバー上部の「Googleでログイン」ボタンをクリック
   - Googleアカウントを選択
   - アクセス許可を確認

2. **リソースを追加**
   - ログイン後、「リソースを追加」ボタンが有効になります
   - リソースを追加すると、あなたのGoogleアカウント名が記録されます

3. **ログアウト**
   - サイドバー上部の「ログアウト」ボタンをクリック

## セキュリティ

- リソースの追加・削除・評価はログインが必要です
- 未ログインのユーザーはリソースを閲覧のみ可能です
- 悪意のあるURLの投稿を防ぐため、すべての投稿はログイン済みユーザーのみ可能です

## トラブルシューティング

### 「redirect_uri_mismatch」エラー

- Google Cloud Consoleで設定したリダイレクトURIと、実際のURLが一致しているか確認してください
- 開発環境: `http://localhost:3000/api/auth/callback/google`
- 本番環境: `https://yourdomain.com/api/auth/callback/google`

### 「invalid_client」エラー

- `GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`が正しく設定されているか確認してください
- 環境変数を変更したら、必ずアプリを再起動してください

### ログインできない

- `NEXTAUTH_SECRET`が設定されているか確認してください
- `NEXTAUTH_URL`が正しく設定されているか確認してください（開発環境は`http://localhost:3000`）

