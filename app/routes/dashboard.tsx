import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
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
  return json({ user, posts })
}

export default function Dashboard() {
  const { user, posts } = useLoaderData<typeof loader>()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <Link
          to="/posts/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          新規投稿
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">プロフィール</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">名前</p>
            <p className="font-medium">{user.name || '未設定'}</p>
          </div>
          <div>
            <p className="text-gray-600">メールアドレス</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">あなたの投稿</h2>
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">まだ投稿がありません。</p>
            <Link to="/posts/new" className="text-indigo-600 hover:underline">
              最初の記事を投稿する
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      <Link
                        to={`/posts/${post.id}`}
                        className="hover:text-indigo-600"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {post.published ? '公開中' : '下書き'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {post.content.length > 100
                      ? `${post.content.substring(0, 100)}...`
                      : post.content}
                  </p>
                  <div className="flex justify-between items-center text-sm">
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
