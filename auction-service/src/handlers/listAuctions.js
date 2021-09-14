import middy from '@middy/core';
import { DynamoDB } from 'aws-sdk';
import httpErrorHandler from '@middy/http-error-handler';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import createHttpError from 'http-errors';

const dynamoDb = new DynamoDB.DocumentClient();

const getAllDynamoDbAuctions = async () => {
  const result = await dynamoDb.scan({
    TableName: process.env.AUCTIONS_TABLE_NAME,
  }).promise();

  return result.Items;
};

const listAuctions = async () => {
  try {
    const auctions = await getAllDynamoDbAuctions();

    return {
      statusCode: 200,
      body: JSON.stringify({
        quantity: auctions.length,
        items: auctions
      }),
    };
  } catch (error) {
    throw new createHttpError.InternalServerError(error);
  }
};

export const handler = middy(listAuctions)
  .use(httpEventNormalizer())
  .use(httpErrorHandler())
  .use(httpJsonBodyParser());