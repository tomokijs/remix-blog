import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@vercel/remix'
import { Link, useLoaderData } from '@remix-run/react'
import { getPost } from '~/utils/post.server'
import { getUser } from '~/utils/auth.server'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.post) {
    return [
      { title: '記事が見つかりません | Remix ブログ' },
      { name: 'description', content: 'お探しの記事は見つかりませんでした。' },
    ]
  }
  return [
    { title: `${data.post.title} | Remix ブログ` },
    { name: 'description', content: data.post.content.substring(0, 160) },
  ]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  const postId = params.postId

  if (!postId || isNaN(Number(postId))) {
    return redirect('/posts')
  }

  const post = await getPost(Number(postId))

  if (!post) {
    throw new Response('記事が見つかりません', { status: 404 })
  }

  // 非公開の投稿は作者のみ閲覧可能
  if (!post.published && (!user || user.id !== post.authorId)) {
    throw new Response('アクセス権限がありません', { status: 403 })
  }

  return json(
    { post, isOwner: user?.id === post.authorId },
    {
      headers: {
        'Cache-Control': post.published
          ? 'public, max-age=60, s-maxage=300, stale-while-revalidate=604800'
          : 'private, no-cache, no-store, must-revalidate',
      },
    }
  )
}

export default function PostDetail() {
  const { post, isOwner } = useLoaderData<typeof loader>()

  return (
    <div className="max-w-4xl mx-auto">
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {post.title}
            </h1>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>投稿者: {post.author.name || post.author.email}</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString('ja-JP')}
              </span>
            </div>
          </header>

          <div className="prose max-w-none text-gray-800">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {isOwner && (
            <div className="mt-8 flex space-x-4">
              <Link
                to={`/posts/${post.id}/edit`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                編集
              </Link>
              <Link
                to={`/posts/${post.id}/delete`}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                削除
              </Link>
            </div>
          )}
        </div>
      </article>

      <div className="mt-8">
        <Link
          to="/posts"
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← 記事一覧に戻る
        </Link>
      </div>
    </div>
  )
}
