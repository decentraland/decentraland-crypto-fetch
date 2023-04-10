import { Authenticator } from "@dcl/crypto/dist/Authenticator";
import { AuthIdentity, Metadata } from "./types";
import { getImplementation } from "./utils";

const AUTH_CHAIN_HEADER_PREFIX = "x-identity-auth-chain-";
const AUTH_TIMESTAMP_HEADER = "x-identity-timestamp";
const AUTH_METADATA_HEADER = "x-identity-metadata";

export type SignedHeaderFactoryOptions = {
  Headers?: typeof Headers;
};

export default function signedHeaderFactory(
  options: SignedHeaderFactoryOptions = {}
) {
  const Headers = getImplementation(options, "Headers");

  return function signedHeader(
    identity: AuthIdentity,
    method: string,
    path: string,
    metadata: Metadata,
    init?: HeadersInit
  ) {
    const headers = new Headers(init);
    const timestamp = String(Date.now());
    const data = JSON.stringify(metadata);
    const payload = [method, path, timestamp, data].join(":").toLowerCase();

    let i = 0;
    const chain = Authenticator.signPayload(identity, payload);
    for (const link of chain) {
      headers.set(AUTH_CHAIN_HEADER_PREFIX + i, JSON.stringify(link));
      i++;
    }

    headers.set(AUTH_TIMESTAMP_HEADER, timestamp);
    headers.set(AUTH_METADATA_HEADER, data);
    return headers;
  };
}
