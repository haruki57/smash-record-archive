import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);
  const result = await prisma.player.findUnique({ where: { id } })
  delete result.tw_user_id
  delete result.tw_access_token
  delete result.tw_screen_name
  delete result.tw_access_token_secret
  res.json(result)
}
