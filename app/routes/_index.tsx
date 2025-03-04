import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { getPublishedPosts } from '~/utils/post.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'Remix ブログ' },
    {
      name: 'description',
      content: 'Remixで作成したシンプルなブログアプリケーション',
    },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const posts = await getPublishedPosts()
  return json({ posts: posts.slice(0, 5) }) // 最新の5件のみ表示
}

export default function Index() {
  const { posts } = useLoaderData<typeof loader>()

  return (
    <div className="flex flex-col gap-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Remix ブログへようこそ
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Remix と Prisma で構築されたシンプルなブログプラットフォームです。
          記事を読んだり、アカウントを作成して自分の記事を投稿したりできます。
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/posts"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
          >
            記事を読む
          </Link>
          <Link
            to="/register"
            className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md hover:bg-gray-50"
          >
            アカウント作成
          </Link>
        </div>
      </section>

      {posts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">最新の記事</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link
                      to={`/posts/${post.id}`}
                      className="hover:text-indigo-600"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {post.content.length > 150
                      ? `${post.content.substring(0, 150)}...`
                      : post.content}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>投稿者: {post.author.name || post.author.email}</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/posts"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              すべての記事を見る →
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
