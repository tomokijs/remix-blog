import { db } from './db.server'

// 全ての投稿を取得
export async function getPosts() {
  return db.post.findMany({
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// 公開済みの投稿のみを取得
export async function getPublishedPosts() {
  return db.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// 特定のユーザーの投稿を取得
export async function getUserPosts(userId: number) {
  return db.post.findMany({
    where: { authorId: userId },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// 投稿を1件取得
export async function getPost(id: number) {
  return db.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}

// 投稿を作成
export async function createPost({
  title,
  content,
  authorId,
  published = false,
}: {
  title: string
  content: string
  authorId: number
  published?: boolean
}) {
  return db.post.create({
    data: {
      title,
      content,
      published,
      author: {
        connect: {
          id: authorId,
        },
      },
    },
  })
}

// 投稿を更新
export async function updatePost({
  id,
  title,
  content,
  published,
}: {
  id: number
  title?: string
  content?: string
  published?: boolean
}) {
  return db.post.update({
    where: { id },
    data: {
      title,
      content,
      published,
    },
  })
}

// 投稿を削除
export async function deletePost(id: number) {
  return db.post.delete({
    where: { id },
  })
}
