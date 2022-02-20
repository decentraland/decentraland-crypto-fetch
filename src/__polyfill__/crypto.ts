import { webcrypto, createHash } from "crypto";
import { CyptoDigest } from "../types";

function createCyptoDigest(): CyptoDigest {
  let crypto: Crypto = webcrypto as any;
  if (!!crypto?.subtle?.digest) {
    return crypto;
  }

  const algorithms: Record<string, string> = {
    "SHA-1": "sha1",
    "SHA-256": "sha256",
    "SHA-384": "sha384",
    "SHA-512": "sha512",
  };

  return {
    subtle: {
      digest: async (algorithm: AlgorithmIdentifier, data: BufferSource) => {
        const hash = createHash(
          algorithms[algorithm as string] || (algorithm as string)
        );
        hash.update(data as Buffer);
        return hash.digest();
      },
    },
  };
}

export default createCyptoDigest();
