
import { DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

const dynamoDb = new DynamoDB.DocumentClient();

const createAuction = async (event, context) => {
    const { title } = JSON.parse(event.body);

    const auction = {
        title,
        id: uuid(),
        createdAt: new Date().toDateString
    };


    return {
        statusCode: 201,
        body: JSON.stringify(auction)
    };
};

export const handler = createAuction;