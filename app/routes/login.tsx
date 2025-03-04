import { useState } from 'react'
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
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
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">ログイン</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <Form method="post">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.email && (
              <p className="text-red-500 mt-1">{actionData.errors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.password && (
              <p className="text-red-500 mt-1">{actionData.errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
