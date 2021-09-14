
import { v4 as uuid } from 'uuid';
import { DynamoDB } from 'aws-sdk';
import createHttpError from 'http-errors';
import { commonMiddleware } from '../middlewares/commonMiddleware';

const dynamoDb = new DynamoDB.DocumentClient();

const createAuctionAtDynamoDb = async (auction) => {
  return dynamoDb.put({
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction
  }).promise();
};

const createAuction = async (event, context) => {
  try {
    const { title } = event.body;

    const auction = {
      title,
      id: uuid(),
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      highestBid: { amount: 0 },
    };

    await createAuctionAtDynamoDb(auction);

    return {
      statusCode: 201,
      body: JSON.stringify(auction)
    };

  } catch (error) {
    throw new createHttpError.InternalServerError(error);
  }
};

export const handler = commonMiddleware(createAuction);