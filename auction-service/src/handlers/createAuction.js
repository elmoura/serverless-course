
import { v4 as uuid } from 'uuid';
import createHttpError from 'http-errors';
import { commonMiddleware } from '../middlewares/commonMiddleware';
import { AuctionsRepository } from '../repositories/auctionsRepository';
import validator from '@middy/validator';
import { createAuctionSchema } from '../schemas/createAuctionSchema';

const auctionsRepository = new AuctionsRepository();

const createAuction = async (event, context) => {
  try {
    const { title } = event.body;
    const currentDate = new Date();
    const endDate = new Date().setDate(currentDate.getDate() + 1);

    const auction = {
      title,
      id: uuid(),
      status: 'OPEN',
      createdAt: currentDate.toISOString(),
      endingAt: new Date(endDate).toISOString(),
      highestBid: { amount: 0 },
    };

    await auctionsRepository.create(auction);

    return {
      statusCode: 201,
      body: JSON.stringify(auction)
    };

  } catch (error) {
    throw new createHttpError.InternalServerError(error);
  }
};

export const handler = commonMiddleware(createAuction).use(
  validator({
    inputSchema: createAuctionSchema,
    ajvOptions: { strict: true }
  })
);