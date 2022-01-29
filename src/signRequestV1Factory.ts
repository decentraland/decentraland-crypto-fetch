import { Authenticator } from "dcl-crypto/dist/Authenticator";
import { getImplementation } from "./utils";
import { SignedRequestOptions } from "./types";

const AUTH_CHAIN_HEADER_PREFIX = "x-identity-auth-chain-";
const AUTH_TIMESTAMP_HEADER = "x-identity-timestamp";
const AUTH_METADATA_HEADER = "x-identity-metadata";

export type SignedHeaderFactoryOptions = {
  URL?: typeof URL;
};

export default function signRequestV1Factory(
  options: SignedHeaderFactoryOptions = {}
) {
  const URL = getImplementation(options, "URL");
  return function signRequestV1(
    request: Request,
    options: SignedRequestOptions = {}
  ): Request {
    if (!options.identity) {
      return request;
    }

    const method = request.method || "get";
    const pathname = new URL(request.url).pathname;
    const timestamp = String(Date.now());
    const data = JSON.stringify(options.metadata || {});
    const payload = [method, pathname, timestamp, data].join(":").toLowerCase();

    let i = 0;
    const chain = Authenticator.signPayload(options.identity, payload);
    for (const link of chain) {
      request.headers.set(AUTH_CHAIN_HEADER_PREFIX + i, JSON.stringify(link));
      i++;
    }

    request.headers.set(AUTH_TIMESTAMP_HEADER, timestamp);
    request.headers.set(AUTH_METADATA_HEADER, data);
    return request;
  };
}
