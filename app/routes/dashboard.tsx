import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { getUser } from '~/utils/auth.server'
import { getUserPosts } from '~/utils/post.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'ダッシュボード | Remix ブログ' },
    { name: 'description', content: 'あなたのブログ投稿を管理する' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user) {
    return redirect('/login')
  }

  const posts = await getUserPosts(user.id)
  return { user, posts }
}

export default function Dashboard() {
  const { user, posts } = useLoaderData<typeof loader>()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <Link
          to="/posts/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          新規投稿
        </Link>
      </div>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          プロフィール
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-gray-600">名前</p>
            <p className="font-medium text-gray-900">{user.name || '未設定'}</p>
          </div>
          <div>
            <p className="text-gray-600">メールアドレス</p>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">あなたの投稿</h2>
        {posts.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow-md">
            <p className="mb-4 text-gray-600">まだ投稿がありません。</p>
            <Link to="/posts/new" className="text-indigo-600 hover:underline">
              最初の記事を投稿する
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      <Link
                        to={`/posts/${post.id}`}
                        className="hover:text-indigo-600"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        post.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {post.published ? '公開中' : '下書き'}
                    </span>
                  </div>
                  <p className="mb-4 text-gray-600">
                    {post.content.length > 100
                      ? `${post.content.substring(0, 100)}...`
                      : post.content}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        to={`/posts/${post.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        編集
                      </Link>
                      <Link
                        to={`/posts/${post.id}/delete`}
                        className="text-red-600 hover:text-red-800"
                      >
                        削除
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
