import validator from "@middy/validator";
import createHttpError from "http-errors";
import { commonMiddleware } from "../middlewares/commonMiddleware";
import { AuctionsRepository } from "../repositories/auctionsRepository";
import { placeBidSchema } from "../schemas/placeBidSchema";

const auctionsRepository = new AuctionsRepository();

export const placeBid = async (event, context) => {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

  const auction = await auctionsRepository.findById(id);

  if (!auction) {
    throw new createHttpError.BadRequest(
      `Auctions with ID "${id}" does not exists`
    );
  }

  const { amount: highestBidAmount, bidder: bidderEmail } = auction.highestBid;

  // Bid identity validation
  if (auction.seller === email) {
    throw new createHttpError.BadRequest("You can't bid your own auction.");
  }

  // Double bidding validation
  if (bidderEmail === email) {
    throw new createHttpError.BadRequest("You're already the highest bidder.'");
  }

  // Auction status validation
  if (auction.status !== "OPEN") {
    throw new createHttpError.Forbidden("You cannot bid on closed auctions");
  }

  // Bid amount validation
  if (highestBidAmount >= amount) {
    throw new createHttpError.BadRequest(
      `The bid amount must be higher than ${highestBidAmount}`
    );
  }

  const updatedAuction = await auctionsRepository.placeBid({
    auctionId: id,
    bidAmount: amount,
    bidderEmail: email,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
};

export const handler = commonMiddleware(placeBid).use(
  validator({
    inputSchema: placeBidSchema,
    ajvOptions: { strict: true },
  })
);
