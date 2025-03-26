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
      values: { name: null, email: null },
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
    name:
      typeof actionData?.values?.name === 'string'
        ? actionData.values.name
        : '',
    email:
      typeof actionData?.values?.email === 'string'
        ? actionData.values.email
        : '',
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
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-center text-3xl font-bold">アカウント登録</h1>
      <div className="rounded-lg bg-white p-8 shadow-md">
        <Form method="post">
          <div className="mb-4">
            <label
              htmlFor="name"
              className="mb-2 block font-medium text-gray-700"
            >
              名前
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full rounded-md border bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.name && (
              <p className="mt-1 text-red-500">{actionData.errors.name}</p>
            )}
          </div>

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

          <div className="mb-4">
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

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="mb-2 block font-medium text-gray-700"
            >
              パスワード（確認）
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="w-full rounded-md border bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
            {actionData?.errors?.confirmPassword && (
              <p className="mt-1 text-red-500">
                {actionData.errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
