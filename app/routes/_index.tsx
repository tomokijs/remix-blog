import type { MetaFunction } from 'react-router'
import { data, Link, useLoaderData } from 'react-router'
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

export async function loader() {
  const posts = await getPublishedPosts()
  return data(
    { posts: posts.slice(0, 5) }, // 最新の5件のみ表示
    {
      headers: {
        'Cache-Control':
          'public, max-age=60, s-maxage=300, stale-while-revalidate=604800',
      },
    },
  )
}

export default function Index() {
  const { posts } = useLoaderData<typeof loader>()

  return (
    <div className="flex flex-col gap-8">
      <section className="py-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Remix ブログへようこそ
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600">
          Remix と Prisma で構築されたシンプルなブログプラットフォームです。
          記事を読んだり、アカウントを作成して自分の記事を投稿したりできます。
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/posts"
            className="rounded-md bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
          >
            記事を読む
          </Link>
          <Link
            to="/register"
            className="rounded-md border border-indigo-600 bg-white px-6 py-3 text-indigo-600 hover:bg-gray-50"
          >
            アカウント作成
          </Link>
        </div>
      </section>

      {posts.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">最新の記事</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    <Link
                      to={`/posts/${post.id}`}
                      className="hover:text-indigo-600"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mb-4 text-gray-600">
                    {post.content.length > 150
                      ? `${post.content.substring(0, 150)}...`
                      : post.content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
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
              className="font-medium text-indigo-600 hover:text-indigo-800"
            >
              すべての記事を見る →
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
