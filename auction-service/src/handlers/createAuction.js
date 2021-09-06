
import { DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

const dynamoDb = new DynamoDB.DocumentClient();

const createAuctionAtDynamoDb = async (auction) => {
    return dynamoDb.put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction
    }).promise();
};

const createAuction = async (event, context) => {
    const { title } = JSON.parse(event.body);

    const auction = {
        title,
        id: uuid(),
        status: 'OPEN',
        createdAt: new Date().toISOString()
    };

    await createAuctionAtDynamoDb(auction);

    return {
        statusCode: 201,
        body: JSON.stringify(auction)
    };
};

export const handler = createAuction;