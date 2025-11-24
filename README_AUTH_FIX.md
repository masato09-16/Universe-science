# Google認証のリダイレクトURI設定エラー修正

「このアプリのリクエストは無効です」というエラーは、Google Cloud Consoleで設定したリダイレクトURIが正しくない場合に発生します。

## 解決方法

### 1. Google Cloud ConsoleでリダイレクトURIを確認・修正

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/ にアクセス
   - プロジェクトを選択

2. **OAuth 2.0 クライアント IDを確認**
   - 左メニューから「APIとサービス」→「認証情報」を選択
   - 作成したOAuth 2.0 クライアント IDをクリック

3. **リダイレクトURIを確認・追加**
   - 「承認済みのリダイレクト URI」セクションを確認
   - 以下のURIが**正確に**追加されているか確認：

   **開発環境（localhost）:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

   **本番環境（デプロイ後）:**
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

4. **URIを追加する場合**
   - 「URIを追加」をクリック
   - 上記のURIを**正確に**入力（末尾のスラッシュなし、大文字小文字も正確に）
   - 「保存」をクリック

### 2. よくある間違い

❌ **間違い:**
- `http://localhost:3000/api/auth/callback/google/` （末尾にスラッシュ）
- `http://localhost:3000/auth/callback/google` （パスが間違っている）
- `https://localhost:3000/api/auth/callback/google` （httpsではなくhttp）

✅ **正しい:**
- `http://localhost:3000/api/auth/callback/google` （正確にこの通り）

### 3. 変更を反映

- Google Cloud Consoleで変更を保存したら、**数分待つ**（反映に時間がかかる場合があります）
- ブラウザを完全にリロード（Ctrl+Shift+R）
- 再度ログインを試す

### 4. それでもエラーが出る場合

1. **OAuth同意画面の設定を確認**
   - 「APIとサービス」→「OAuth同意画面」を確認
   - アプリが公開されているか、テストユーザーに追加されているか確認

2. **クライアントIDとシークレットを再確認**
   - `.env`ファイルの`GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`が正しいか確認
   - コピー&ペースト時に余分なスペースが入っていないか確認

3. **開発サーバーを再起動**
   ```bash
   # サーバーを停止（Ctrl+C）
   # 再度起動
   npm run dev
   ```

## 確認チェックリスト

- [ ] Google Cloud ConsoleでリダイレクトURIが正確に設定されている
- [ ] `.env`ファイルに`GOOGLE_CLIENT_ID`が設定されている
- [ ] `.env`ファイルに`GOOGLE_CLIENT_SECRET`が設定されている
- [ ] `.env`ファイルに`NEXTAUTH_SECRET`が設定されている
- [ ] `.env`ファイルに`NEXTAUTH_URL=http://localhost:3000`が設定されている
- [ ] 開発サーバーを再起動した
- [ ] ブラウザを完全にリロードした

