import type { Request, Response } from 'express'

import { noCacheControl } from './cache-control'

export default function reqHeaders(req: Request, res: Response) {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Not found' })
    return
  }
  noCacheControl(res)
  const safeHeaders = { ...req.headers }
  delete safeHeaders.cookie
  delete safeHeaders.authorization
  res.json({
    'request-headers': safeHeaders,
  })
}
