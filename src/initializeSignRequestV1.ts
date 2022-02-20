import { Authenticator } from "dcl-crypto/dist/Authenticator";
import { getImplementation } from "./utils";
import { SignedRequestV1Options } from "./types";

const AUTH_CHAIN_HEADER_PREFIX = "x-identity-auth-chain-";
const AUTH_TIMESTAMP_HEADER = "x-identity-timestamp";
const AUTH_METADATA_HEADER = "x-identity-metadata";

export type SignedFetchV1Options = {
  URL?: typeof URL;
};

export default function initializeSignRequestV1(
  options: SignedFetchV1Options = {}
) {
  const URL = getImplementation(options, "URL");
  return async function signRequestV1(
    request: Pick<Request, "method" | "url"> & {
      headers: Pick<Request["headers"], "set">;
    },
    options: SignedRequestV1Options = {}
  ): Promise<Request> {
    if (!options.identity) {
      return request as Request;
    }

    const method = request.method || "GET";
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
    return request as Request;
  };
}
