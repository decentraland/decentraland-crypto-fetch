import type { AuthIdentity } from "dcl-crypto/dist/types";

export { AuthIdentity };
export type Metadata = Record<string, any>;
export type SignedRequestInfo = string | URL | Pick<Request, "url" | "method">;
export type SignedRequestV1Options = {
  identity?: AuthIdentity;
  metadata?: Metadata;
};

export type SignedRequestV2Options = {
  identity?: AuthIdentity;
  metadata?: Metadata;
  expiresIn?: number;
  algorithm?: HashAlgorithm;
  signHeaders?: string[];
};

export type SignedRequestInit = RequestInit & SignedRequestV1Options;

export type CyptoDigest = { subtle: Pick<Crypto["subtle"], "digest"> };

export type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export type HashOptions = {
  crypto?: CyptoDigest;
  algorithm?: HashAlgorithm;
};
