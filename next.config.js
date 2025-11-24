/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // 型チェックをビルド時にスキップ（Vercelでエラーが発生する場合）
    ignoreBuildErrors: false,
  },
  // 出力ディレクトリの設定（ルートに生成されることを明示）
  distDir: '.next',
  webpack: (config, { isServer }) => {
    // app/.next を無視
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/.next/**', '**/app/.next/**'],
    };
    return config;
  },
}

module.exports = nextConfig

