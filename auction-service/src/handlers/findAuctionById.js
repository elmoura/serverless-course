import createHttpError from "http-errors";
import { commonMiddleware } from "../middlewares/commonMiddleware";
import { AuctionsRepository } from "../repositories/auctionsRepository";

const auctionsRepository = new AuctionsRepository();

export const findAuctionById = async (event, context) => {
  const { id } = event.pathParameters;

  const auction = await auctionsRepository.findById(id);

  if (!auction) {
    throw new createHttpError.NotFound(`Auction with ID "${id}" not found.`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

export const handler = commonMiddleware(findAuctionById);