import { PrismaClient } from '@prisma/client'

// PrismaClientをグローバル変数として宣言して、開発環境でのホットリロード時に
// 複数のPrismaClientインスタンスが作成されるのを防ぎます
declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined
}

// このアプローチはPrismaのドキュメントで推奨されています
// https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
let db: PrismaClient

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient()
  }
  db = global.__db
}

export { db }
