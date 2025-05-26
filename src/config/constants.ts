import dotenv from 'dotenv';
dotenv.config();

function ensureEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Biến môi trường chưa thiết lập: ${name}`);
    process.exit(1);
  }
  return value;
}

export const constants = {
  port: ensureEnv('PORT'),
  db: ensureEnv('DATABASE_URL'),
  googleOAuth: {
    client_id: ensureEnv('GOOGLE_CLIENT_ID'),
    client_secret: ensureEnv('GOOGLE_CLIENT_SECRET'),
  },
  githubOAuth: {
    client_id: ensureEnv('GITHUB_CLIENT_ID'),
    client_secret: ensureEnv('GITHUB_CLIENT_SECRET'),
  },
  cloudinary: {
    name: ensureEnv('CLOUDINARY_CLOUD_NAME'),
    key: ensureEnv('CLOUDINARY_API_KEY'),
    secret: ensureEnv('CLOUDINARY_API_SECRET'),
  },
  nodemailer: {
    service: ensureEnv('MAILER_SERVICE'),
    email: ensureEnv('MAILER_EMAIL'),
    password: ensureEnv('MAILER_PASSWORD'),
  },
  secrets: {
    jwt: {
      secret: ensureEnv('JWT_SECRET'),
      exp: 3600000,
    },
    verificationToken: {
      exp: 1800000, // 30 phút
    },
  },
  cookie: {
    maxAge: 3600000,
  },
  defaultAvatar:
    'https://res.cloudinary.com/dd9pxbgax/image/upload/v1744253824/user_s8cg2b.svg',
  saltWorkFactor: 10,
  passwordResetExp: 3600000,
};
