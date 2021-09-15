import validator from '@middy/validator';
import { commonMiddleware } from '../middlewares/commonMiddleware';
import { AuctionsRepository } from '../repositories/auctionsRepository';
import { listAuctionsSchema } from '../schemas/listAuctionsSchema';

const auctionsRepository = new AuctionsRepository();

const listAuctions = async (event, context) => {
  const { status = 'OPEN' } = event.queryStringParameters;

  const auctions = await auctionsRepository.listByStatus(status);

  return {
    statusCode: 200,
    body: JSON.stringify({
      quantity: auctions && auctions.length,
      items: auctions
    }),
  };
};

export const handler = commonMiddleware(listAuctions).use(
  validator({
    inputSchema: listAuctionsSchema,
    ajvOptions: {
      useDefaults: true,
      strict: false,
    },
  })
);