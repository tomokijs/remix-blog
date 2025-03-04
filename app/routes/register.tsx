import { useState } from 'react'
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, useActionData, useNavigation } from '@remix-run/react'
import { createUserSession, register } from '~/utils/auth.server'
import { db } from '~/utils/db.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'アカウント登録 | Remix ブログ' },
    { name: 'description', content: 'Remix ブログに新規登録する' },
  ]
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const name = formData.get('name')
  const email = formData.get('email')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  // バリデーション
  const errors = {
    name: name ? null : '名前を入力してください',
    email: email ? null : 'メールアドレスを入力してください',
    password: password ? null : 'パスワードを入力してください',
    confirmPassword:
      confirmPassword && password === confirmPassword
        ? null
        : 'パスワードが一致しません',
  }

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage)
  if (hasErrors) {
    return json({ errors, values: { name, email } })
  }

  // 型チェック
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return json({
      errors: {
        email: '無効な入力です',
        password: null,
        name: null,
        confirmPassword: null,
      },
    })
  }

  // メールアドレスの重複チェック
  const existingUser = await db.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return json({
      errors: {
        email: 'このメールアドレスは既に使用されています',
        password: null,
        name: null,
        confirmPassword: null,
      },
      values: { name, email },
    })
  }

  // ユーザー登録
  const user = await register({ name, email, password })

  // セッション作成とリダイレクト
  return createUserSession(user.id, '/dashboard')
}

export default function Register() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const [formData, setFormData] = useState({
    name: actionData?.values?.name || '',
    email: actionData?.values?.email || '',
    password: '',
    confirmPassword: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">アカウント登録</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <Form method="post">
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              名前
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.name && (
              <p className="text-red-500 mt-1">{actionData.errors.name}</p>
            )}
          </div>

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
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.email && (
              <p className="text-red-500 mt-1">{actionData.errors.email}</p>
            )}
          </div>

          <div className="mb-4">
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
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.password && (
              <p className="text-red-500 mt-1">{actionData.errors.password}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 font-medium mb-2"
            >
              パスワード（確認）
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.confirmPassword && (
              <p className="text-red-500 mt-1">
                {actionData.errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? '登録中...' : '登録する'}
          </button>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            既にアカウントをお持ちの場合は{' '}
            <Link to="/login" className="text-indigo-600 hover:underline">
              ログイン
            </Link>
            してください。
          </p>
        </div>
      </div>
    </div>
  )
}
