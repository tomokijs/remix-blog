/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { handleRequest } from '@vercel/remix'
import { RemixServer } from '@remix-run/react'
import type { EntryContext } from '@vercel/remix'

export default function (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const remixServer = <RemixServer context={remixContext} url={request.url} />
  return handleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixServer
  )
}
