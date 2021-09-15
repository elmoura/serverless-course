import { commonMiddleware } from '../middlewares/commonMiddleware';
import { AuctionsRepository } from '../repositories/auctionsRepository';

const auctionsRepository = new AuctionsRepository();

const listAuctions = async () => {
  const auctions = await auctionsRepository.listAll();

  return {
    statusCode: 200,
    body: JSON.stringify({
      quantity: auctions.length,
      items: auctions
    }),
  };
};

export const handler = commonMiddleware(listAuctions);