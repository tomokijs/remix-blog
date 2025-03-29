import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from 'react-router'
import { redirect, Form, useLoaderData, useNavigation } from 'react-router'

import { getUser } from '~/utils/auth.server'
import { deletePost, getPost } from '~/utils/post.server'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.post) {
    return [
      { title: '記事が見つかりません | Remix ブログ' },
      { name: 'description', content: 'お探しの記事は見つかりませんでした。' },
    ]
  }
  return [
    { title: `${data.post.title}を削除 | Remix ブログ` },
    { name: 'description', content: 'ブログ記事を削除する' },
  ]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user) {
    return redirect('/login')
  }

  const postId = params.postId
  if (!postId || isNaN(Number(postId))) {
    return redirect('/dashboard')
  }

  const post = await getPost(Number(postId))
  if (!post) {
    throw new Response('記事が見つかりません', { status: 404 })
  }

  // 投稿者のみ削除可能
  if (user.id !== post.authorId) {
    return redirect(`/posts/${post.id}`)
  }

  return { post }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user) {
    return redirect('/login')
  }

  const postId = params.postId
  if (!postId || isNaN(Number(postId))) {
    return redirect('/dashboard')
  }

  const post = await getPost(Number(postId))
  if (!post) {
    throw new Response('記事が見つかりません', { status: 404 })
  }

  // 投稿者のみ削除可能
  if (user.id !== post.authorId) {
    return redirect(`/posts/${post.id}`)
  }

  await deletePost(post.id)
  return redirect('/dashboard')
}

export default function DeletePost() {
  const { post } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-center text-3xl font-bold">投稿を削除</h1>
      <div className="rounded-lg bg-white p-8 shadow-md">
        <p className="mb-6 text-gray-700">
          「{post.title}」を削除してもよろしいですか？この操作は取り消せません。
        </p>

        <Form method="post">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? '削除中...' : '削除する'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}
