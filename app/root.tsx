import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useLoaderData,
} from '@remix-run/react'
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'

import './tailwind.css'
import { getUser } from './utils/auth.server'

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  return json({ user })
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-gray-50">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                Remix ブログ
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/posts" className="text-gray-700 hover:text-indigo-600">
                ブログ一覧
              </Link>
              {user ? (
                <>
                  <Link
                    to="/posts/new"
                    className="text-gray-700 hover:text-indigo-600"
                  >
                    新規投稿
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-indigo-600"
                  >
                    ダッシュボード
                  </Link>
                  <form action="/logout" method="post">
                    <button
                      type="submit"
                      className="text-gray-700 hover:text-indigo-600"
                    >
                      ログアウト
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-indigo-600"
                  >
                    ログイン
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                  >
                    登録
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            &copy; {new Date().getFullYear()} Remix ブログ
          </p>
        </div>
      </footer>
    </div>
  )
}
