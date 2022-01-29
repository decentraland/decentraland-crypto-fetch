import type { AuthIdentity } from "dcl-crypto/dist/types";

export { AuthIdentity };
export type Metadata = Record<string, any>;
export type SignedRequestInfo = string | URL | Pick<Request, "url" | "method">;
export type SignedRequestOptions = {
  identity?: AuthIdentity;
  metadata?: Metadata;
};
export type SignedRequestInit = RequestInit & SignedRequestOptions;
