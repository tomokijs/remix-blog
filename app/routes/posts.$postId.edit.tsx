import { useState } from 'react'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
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

  return json({ post })
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
    return json({ errors, values: { title, content, publishStatus } })
  }

  // 型チェック
  if (
    typeof title !== 'string' ||
    typeof content !== 'string' ||
    (publishStatus !== 'draft' && publishStatus !== 'publish')
  ) {
    return json({
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
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">投稿を編集</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <Form method="post">
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-2"
            >
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.title && (
              <p className="text-red-500 mt-1">{actionData.errors.title}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="content"
              className="block text-gray-700 font-medium mb-2"
            >
              内容
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.content}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.content && (
              <p className="text-red-500 mt-1">{actionData.errors.content}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="publishStatus"
              className="block text-gray-700 font-medium mb-2"
            >
              公開ステータス
            </label>
            <select
              id="publishStatus"
              name="publishStatus"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
