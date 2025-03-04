import { PrismaClient } from '@prisma/client'

let db: PrismaClient

declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined
}

// このアプローチはPrismaの推奨方法で、開発中のホットリロードでの接続数の増加を防ぎます
if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient()
  }
  db = global.__db
}

export { db }
