import { DynamoDB } from "aws-sdk";
import createHttpError from "http-errors";
import { commonMiddleware } from "../middlewares/commonMiddleware";

const dynamoDb = new DynamoDB.DocumentClient();

export const findDynamoAuctionById = async (id) => {
  try {
    const result = await dynamoDb.get({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
    }).promise();

    return result.Item;
  } catch (error) {
    throw new createHttpError.InternalServerError(error);
  }
};

export const findAuctionById = async (event, context) => {
  const { id } = event.pathParameters;

  const auction = await findDynamoAuctionById(id);

  if (!auction) {
    throw new createHttpError.NotFound(`Auction with ID "${id}" not found.`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

export const handler = commonMiddleware(findAuctionById);