import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "middy-middleware-json-error-handler";

export const commonMiddleware = (handler) => middy(handler)
  .use(httpErrorHandler())
  .use(httpEventNormalizer())
  .use(jsonBodyParser());