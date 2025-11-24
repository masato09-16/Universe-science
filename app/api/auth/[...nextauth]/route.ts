import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// 環境変数の検証
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
};

const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
}

// デバッグ用: 環境変数をログ出力
if (process.env.VERCEL || process.env.NODE_ENV === 'development') {
  console.log('=== NextAuth Configuration ===');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set (will use auto-detection)');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'Not set');
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set');
  console.log('Expected redirect URI:', process.env.NEXTAUTH_URL 
    ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    : 'Will be auto-detected by trustHost');
  console.log('=============================');
}

// 必須環境変数が設定されていない場合はエラーを投げる
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    'Missing required environment variables: GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET. ' +
    'Please set them in Vercel environment variables.'
  );
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    'Missing required environment variable: NEXTAUTH_SECRET. ' +
    'Please set it in Vercel environment variables.'
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET!,
  trustHost: true, // Vercelなどのホスティング環境で自動的にURLを検出
  debug: process.env.NODE_ENV === 'development',
});

export const { GET, POST } = handlers;

