import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { data, redirect } from '@remix-run/node'
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

  return data(
    { post, isOwner: user?.id === post.authorId },
    {
      headers: {
        'Cache-Control': post.published
          ? 'public, max-age=60, s-maxage=300, stale-while-revalidate=604800'
          : 'private, no-cache, no-store, must-revalidate',
      },
    },
  )
}

export default function PostDetail() {
  const { post, isOwner } = useLoaderData<typeof loader>()

  return (
    <div className="mx-auto max-w-4xl">
      <article className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-8">
          <header className="mb-6">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {post.title}
            </h1>
            <div className="flex items-center justify-between text-sm text-gray-500">
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
                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                編集
              </Link>
              <Link
                to={`/posts/${post.id}/delete`}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
          className="font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← 記事一覧に戻る
        </Link>
      </div>
    </div>
  )
}
