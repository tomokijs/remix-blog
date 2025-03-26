import { useState } from 'react'
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, useActionData, useNavigation } from '@remix-run/react'
import { createUserSession, login } from '~/utils/auth.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'ログイン | Remix ブログ' },
    { name: 'description', content: 'Remix ブログにログインする' },
  ]
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')

  // バリデーション
  const errors = {
    email: email ? null : 'メールアドレスを入力してください',
    password: password ? null : 'パスワードを入力してください',
  }

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage)
  if (hasErrors) {
    return json({ errors })
  }

  // ログイン処理
  if (typeof email !== 'string' || typeof password !== 'string') {
    return json({ errors: { email: '無効な入力です', password: null } })
  }

  const user = await login({ email, password })
  if (!user) {
    return json({
      errors: {
        email: 'メールアドレスまたはパスワードが正しくありません',
        password: null,
      },
    })
  }

  // セッション作成とリダイレクト
  return createUserSession(user.id, '/dashboard')
}

export default function Login() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-center text-3xl font-bold">ログイン</h1>
      <div className="rounded-lg bg-white p-8 shadow-md">
        <Form method="post">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block font-medium text-gray-700"
            >
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full rounded-md border bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.email && (
              <p className="mt-1 text-red-500">{actionData.errors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block font-medium text-gray-700"
            >
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full rounded-md border bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.password && (
              <p className="mt-1 text-red-500">{actionData.errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </button>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            アカウントをお持ちでない場合は{' '}
            <Link to="/register" className="text-indigo-600 hover:underline">
              登録
            </Link>
            してください。
          </p>
        </div>
      </div>
    </div>
  )
}
