/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // 型チェックをビルド時にスキップ（Vercelでエラーが発生する場合）
    ignoreBuildErrors: false,
  },
  // 出力ディレクトリの設定
  distDir: '.next',
}

module.exports = nextConfig

