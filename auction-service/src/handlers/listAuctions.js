import { DynamoDB } from 'aws-sdk';
import createHttpError from 'http-errors';
import { commonMiddleware } from '../middlewares/commonMiddleware';

const dynamoDb = new DynamoDB.DocumentClient();

const getAllDynamoDbAuctions = async () => {
  try {
    const result = await dynamoDb.scan({
      TableName: process.env.AUCTIONS_TABLE_NAME,
    }).promise();

    return result.Items;
  } catch (error) {
    throw new createHttpError.InternalServerError(error);
  }
};

const listAuctions = async () => {
  const auctions = await getAllDynamoDbAuctions();

  return {
    statusCode: 200,
    body: JSON.stringify({
      quantity: auctions.length,
      items: auctions
    }),
  };
};

export const handler = commonMiddleware(listAuctions);