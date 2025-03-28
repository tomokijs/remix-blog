import { useState } from 'react'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { data, redirect } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react'
import { getUser } from '~/utils/auth.server'
import { getPost, updatePost } from '~/utils/post.server'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.post) {
    return [
      { title: '記事が見つかりません | Remix ブログ' },
      { name: 'description', content: 'お探しの記事は見つかりませんでした。' },
    ]
  }
  return [
    { title: `${data.post.title}を編集 | Remix ブログ` },
    { name: 'description', content: 'ブログ記事を編集する' },
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

  // 投稿者のみ編集可能
  if (user.id !== post.authorId) {
    return redirect(`/posts/${post.id}`)
  }

  return { post }
}

type ActionData = {
  errors?: {
    title: string | null
    content: string | null
  }
  values?: {
    title: string | null
    content: string | null
    publishStatus: string | null
  }
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

  // 投稿者のみ編集可能
  if (user.id !== post.authorId) {
    return redirect(`/posts/${post.id}`)
  }

  const formData = await request.formData()
  const title = formData.get('title')
  const content = formData.get('content')
  const publishStatus = formData.get('publishStatus')

  // バリデーション
  const errors = {
    title: title ? null : 'タイトルを入力してください',
    content: content ? null : '内容を入力してください',
  }

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage)
  if (hasErrors) {
    return data<ActionData>({
      errors,
      values: {
        title: title as string | null,
        content: content as string | null,
        publishStatus: publishStatus as string | null,
      },
    })
  }

  // 型チェック
  if (
    typeof title !== 'string' ||
    typeof content !== 'string' ||
    (publishStatus !== 'draft' && publishStatus !== 'publish')
  ) {
    return data<ActionData>({
      errors: {
        title: '無効な入力です',
        content: '無効な入力です',
      },
    })
  }

  // 投稿更新
  await updatePost({
    id: post.id,
    title,
    content,
    published: publishStatus === 'publish',
  })

  return redirect(`/posts/${post.id}`)
}

export default function EditPost() {
  const { post } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const [formData, setFormData] = useState({
    title: actionData?.values?.title || post.title,
    content: actionData?.values?.content || post.content,
    publishStatus:
      actionData?.values?.publishStatus ||
      (post.published ? 'publish' : 'draft'),
  })

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">投稿を編集</h1>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <Form method="post">
          <div className="mb-4">
            <label
              htmlFor="title"
              className="mb-2 block font-medium text-gray-700"
            >
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full rounded-md border bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.title && (
              <p className="mt-1 text-red-500">{actionData.errors.title}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="content"
              className="mb-2 block font-medium text-gray-700"
            >
              内容
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              className="w-full rounded-md border bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.content}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.content && (
              <p className="mt-1 text-red-500">{actionData.errors.content}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="publishStatus"
              className="mb-2 block font-medium text-gray-700"
            >
              公開ステータス
            </label>
            <select
              id="publishStatus"
              name="publishStatus"
              className="w-full rounded-md border bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.publishStatus}
              onChange={handleInputChange}
            >
              <option value="draft">下書き</option>
              <option value="publish">公開</option>
            </select>
          </div>

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
              className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}
