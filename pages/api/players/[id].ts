import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);
  const result = await prisma.player.findUnique({ where: { id } })
  res.json(result)
}
