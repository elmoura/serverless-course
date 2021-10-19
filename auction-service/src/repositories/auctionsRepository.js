import { DynamoDB } from "aws-sdk";
import createHttpError from "http-errors";

export class AuctionsRepository {
  constructor() {
    this.dynamoDbConnection = new DynamoDB.DocumentClient();
  }

  async findById(id) {
    try {
      const result = await this.dynamoDbConnection
        .get({
          TableName: process.env.AUCTIONS_TABLE_NAME,
          Key: { id },
        })
        .promise();

      return result.Item;
    } catch (error) {
      throw new createHttpError.InternalServerError(error);
    }
  }

  async create(auction) {
    try {
      return this.dynamoDbConnection
        .put({
          TableName: process.env.AUCTIONS_TABLE_NAME,
          Item: auction,
        })
        .promise();
    } catch (error) {
      throw new createHttpError.InternalServerError(error);
    }
  }

  async listByStatus(status) {
    try {
      const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: "statusAndEndDate",
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeValues: { ":status": status },
        ExpressionAttributeNames: { "#status": "status" },
      };

      const result = await this.dynamoDbConnection.query(params).promise();
      return result.Items;
    } catch (error) {
      throw new createHttpError.InternalServerError(error);
    }
  }

  async placeBid({ auctionId, bidAmount, bidderEmail }) {
    try {
      const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id: auctionId },
        UpdateExpression:
          "set highestBid.amount = :amount, highestBid.bidder = :bidder",
        ExpressionAttributeValues: {
          ":amount": bidAmount,
          ":bidder": bidderEmail,
        },
        ReturnValues: "ALL_NEW",
      };

      const updateResult = await this.dynamoDbConnection
        .update(params)
        .promise();

      return updateResult.Attributes;
    } catch (error) {
      throw new createHttpError.InternalServerError(error);
    }
  }

  async getEndedAuctions() {
    const currentDate = new Date();
    const findExpiredOpenAuctionsParams = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status AND endingAt <= :now",
      ExpressionAttributeValues: {
        ":status": "OPEN",
        ":now": currentDate.toISOString(),
      },
      ExpressionAttributeNames: {
        "#status": "status", // workaround for reserved words
      },
    };

    const result = await this.dynamoDbConnection
      .query(findExpiredOpenAuctionsParams)
      .promise();
    return result.Items;
  }

  async closeAuction(auction) {
    const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id: auction.id },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeValues: {
        ":status": "CLOSED",
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    const result = await this.dynamoDbConnection.update(params).promise();
    return result.Attributes;
  }
}
