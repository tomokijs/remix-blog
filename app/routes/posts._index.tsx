import type { MetaFunction } from 'react-router'
import { data, Link, useLoaderData } from 'react-router'

import { getPublishedPosts } from '~/utils/post.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'ブログ記事一覧 | Remix ブログ' },
    { name: 'description', content: 'Remix ブログの記事一覧' },
  ]
}

export async function loader() {
  const posts = await getPublishedPosts()
  return data(
    { posts },
    {
      headers: {
        'Cache-Control':
          'public, max-age=60, s-maxage=300, stale-while-revalidate=604800',
      },
    },
  )
}

export default function PostsIndex() {
  const { posts } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">ブログ記事一覧</h1>

      {posts.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center shadow-md">
          <p className="text-gray-600">まだ投稿がありません。</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="p-6">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  <Link
                    to={`/posts/${post.id}`}
                    className="hover:text-indigo-600"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mb-4 text-gray-600">
                  {post.content.length > 300
                    ? `${post.content.substring(0, 300)}...`
                    : post.content}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>投稿者: {post.author.name || post.author.email}</span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/posts/${post.id}`}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    続きを読む →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
