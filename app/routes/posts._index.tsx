import type { MetaFunction } from '@remix-run/node'
import { json } from '@vercel/remix'
import { Link, useLoaderData } from '@remix-run/react'
import { getPublishedPosts } from '~/utils/post.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'ブログ記事一覧 | Remix ブログ' },
    { name: 'description', content: 'Remix ブログの記事一覧' },
  ]
}

export async function loader() {
  const posts = await getPublishedPosts()
  return json(
    { posts },
    {
      headers: {
        'Cache-Control':
          'public, max-age=60, s-maxage=300, stale-while-revalidate=604800',
      },
    }
  )
}

export default function PostsIndex() {
  const { posts } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">ブログ記事一覧</h1>

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">まだ投稿がありません。</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  <Link
                    to={`/posts/${post.id}`}
                    className="hover:text-indigo-600"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4">
                  {post.content.length > 300
                    ? `${post.content.substring(0, 300)}...`
                    : post.content}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>投稿者: {post.author.name || post.author.email}</span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/posts/${post.id}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
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
