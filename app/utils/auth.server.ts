import { db } from './db.server'
import bcrypt from 'bcryptjs'
import { createCookieSessionStorage, redirect } from '@remix-run/node'

// セッションストレージの設定
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'remix_blog_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: ['s3cr3t'],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30日間
    httpOnly: true,
  },
})

// ユーザーセッションの取得
export async function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('Cookie'))
}

// ログインユーザーのIDを取得
export async function getUserId(request: Request) {
  const session = await getUserSession(request)
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'number') return null
  return userId
}

// ログインユーザーの情報を取得
export async function getUser(request: Request) {
  const userId = await getUserId(request)
  if (typeof userId !== 'number') {
    return null
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    })
    return user
  } catch {
    throw logout(request)
  }
}

// ログイン処理
export async function login({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const user = await db.user.findUnique({
    where: { email },
  })

  if (!user) return null

  const isCorrectPassword = await bcrypt.compare(password, user.password)
  if (!isCorrectPassword) return null

  return { id: user.id, email: user.email }
}

// ユーザー登録処理
export async function register({
  email,
  password,
  name,
}: {
  email: string
  password: string
  name?: string
}) {
  const hashedPassword = await bcrypt.hash(password, 10)
  return db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  })
}

// セッションの作成
export async function createUserSession(userId: number, redirectTo: string) {
  const session = await sessionStorage.getSession()
  session.set('userId', userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  })
}

// ログアウト処理
export async function logout(request: Request) {
  const session = await getUserSession(request)
  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
}
