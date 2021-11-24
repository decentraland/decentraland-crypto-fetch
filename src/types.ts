import type { AuthIdentity } from "dcl-crypto/dist/types";

export { AuthIdentity };
export type Metadata = Record<string, any>;
export type SignedRequestInit = RequestInit & {
  identity: AuthIdentity;
  metadata?: Metadata;
};
