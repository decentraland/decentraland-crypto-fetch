import initializeSignRequestV1, {
  SignedFetchV1Options,
} from "./initializeSignRequestV1";
import initializeSignRequestV2, {
  SignedFetchV2Options,
} from "./initializeSignRequestV2";
import { SignedRequestInfo, SignedRequestInit } from "./types";
import { getImplementation } from "./utils";

export type SignedFetchOptions = {
  version?: 2 | 1;
  Request?: typeof Request;
  fetch?: typeof fetch;
} & SignedFetchV1Options &
  SignedFetchV2Options;

export default function initializeSignedFetch(
  options: SignedFetchOptions = {}
) {
  const signRequestV1 =
    options.version === 1
      ? initializeSignRequestV1(options)
      : initializeSignRequestV2(options);
  const Request = getImplementation(options, "Request");
  const fetch = getImplementation(options, "fetch");

  return async function signedFetch(
    input: SignedRequestInfo,
    init?: SignedRequestInit | undefined
  ) {
    if (init && init.identity) {
      const { identity, metadata, ...originalInit } = init;
      const request = await signRequestV1(
        new Request(input as RequestInfo, originalInit),
        { identity, metadata }
      );
      return fetch(request);
    }

    return fetch(input as RequestInfo, init);
  };
}
