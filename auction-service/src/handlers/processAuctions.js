import createHttpError from "http-errors";
import { AuctionsRepository } from "../repositories/auctionsRepository";

const auctionsRepository = new AuctionsRepository();

export const processAuctions = async (event, context) => {
  try {
    const auctionsToClose = await auctionsRepository.getEndedAuctions();

    const closeAuctionPromises = auctionsToClose.map(
      async (auction) => auctionsRepository.closeAuction(auction)
    );

    const closedAuctions = await Promise.all(closeAuctionPromises);

    return {
      quantityClosed: closedAuctions.length,
      items: closedAuctions,
    };
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(error);
  }
};

export const handler = processAuctions;