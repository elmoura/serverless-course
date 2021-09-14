import { DynamoDB } from "aws-sdk";
import createHttpError from "http-errors";
import { commonMiddleware } from "../middlewares/commonMiddleware";
import { findDynamoAuctionById } from "./findAuctionById";

const dynamoDb = new DynamoDB.DocumentClient();

export const placeBidAtDynamoDb = async (auctionId, bidAmount) => {
  try {
    const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id: auctionId },
      UpdateExpression: 'set highestBid.amount = :amount',
      ExpressionAttributeValues: {
        ':amount': bidAmount,
      },
      ReturnValues: 'ALL_NEW'
    };

    const updateResult = await dynamoDb.update(params).promise();

    return updateResult.Attributes;
  } catch (error) {
    throw new createHttpError.InternalServerError(error);
  }
};

export const placeBid = async (event, context) => {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const auction = await findDynamoAuctionById(id);

  if (!auction) {
    throw new createHttpError.BadRequest(`Auctions with ID "${id}" does not exists`);
  }

  const highestBidAmount = auction.highestBid.amount;

  if (highestBidAmount >= amount) {
    throw new createHttpError.BadRequest(`The bid amount must be higher than ${highestBidAmount}`);
  }

  const updatedAuction = await placeBidAtDynamoDb(id, amount);

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
};

export const handler = commonMiddleware(placeBid);