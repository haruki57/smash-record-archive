// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION });
  console.log(req.query)
  const getCommand = new GetItemCommand(
    {
      TableName: "smashrecordarchive-players",
      Key: { id: { N: (req.query.id) as string } }
    }
  );
  const ret = await dynamo.send(getCommand);
  console.log(ret.Item?.playerJson.S);
  
  res.status(200).setHeader('Content-Type', 'text/plain;charset=utf-8').send(ret.Item?.playerJson.S);
}
