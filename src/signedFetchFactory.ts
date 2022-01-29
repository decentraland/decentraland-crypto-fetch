import signRequestV1Factory from "./signRequestV1Factory";
import { SignedRequestInfo, SignedRequestInit } from "./types";
import { getImplementation } from "./utils";

export type SignedFetchFactoryOptions = {
  URL?: typeof URL;
  Request?: typeof Request;
  fetch?: typeof fetch;
};

export default function signedFetchFactory(
  options: SignedFetchFactoryOptions = {}
) {
  const signRequestV1 = signRequestV1Factory(options);
  const Request = getImplementation(options, "Request");
  const fetch = getImplementation(options, "fetch");

  return function signedFetch(
    input: SignedRequestInfo,
    init?: SignedRequestInit | undefined
  ) {
    if (init && init.identity) {
      const { identity, metadata, ...originalInit } = init;
      let request = new Request(input as RequestInfo, originalInit);
      return fetch(signRequestV1(request, { identity, metadata }));
    }

    return fetch(input as RequestInfo, init);
  };
}
