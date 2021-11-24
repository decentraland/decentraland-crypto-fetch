# decentraland-crypto-fetch

[![Coverage Status](https://coveralls.io/repos/github/decentraland/decentraland-crypto-fetch/badge.svg?branch=main)](https://coveralls.io/github/decentraland/decentraland-crypto-fetch?branch=main)

- [Install](#install)
- [Usage](#usage)
  - [Auth Chain Generator](#auth-chain-generator)
  - [Identity Generator](#identity-generator)
- [Inject fetcher](#inject-fetcher)
- [Server](#server)
- [Develop](#develop)

Make requests signed using a [Decentraland Identity](https://github.com/decentraland/decentraland-crypto)

## Install

```bash
  npm install decentraland-crypto-fetch
```

## Usage

This library preserves the native [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) API and works on browsers and nodejs, you only need an Identity generate with [`dcl-crypto`](https://github.com/decentraland/decentraland-crypto)

```typescript
import fetch from "decentraland-crypto-fetch";

fetch("https://service.decentraland.org/api/resource", {
  method: "POST",
  identity,
});
```

you can send signed metadata using the `metadata` property

```typescript
import fetch from "decentraland-crypto-fetch";

const metadata = { key1: "value1" };

fetch("https://service.decentraland.org/api/resource", {
  method: "POST",
  identity,
  metadata,
});
```

You can also inject sign headers into an existing request

```typescript
import fetch from "decentraland-crypto-fetch";

const metadata = { key1: "value1" };
const request = new Request("https://service.decentraland.org/api/resource", {
  method: "POST",
});

fetch(request, { identity, metadata });
```

### Auth Chain Generator

If you want to simulate signed headers you can use the [`Auth Chain Generator`](https://git.io/Jimns)

### Identity Generator

If you need an ephemeral identity you can generate one using the [`Identity Generator`](https://git.io/JMJmU)

## Inject fetcher

If your environment doesn't have a global [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) function, you can create a signedFetch injecting your own implementations as follow

```typescript
import { signedFetchFactory } from "decentraland-crypto-fetch/lib/factory";
import { Headers, Request, fetch } from "node-fetch";

const signedFetch = signedFetchFactory({ Headers, Request, fetch });
```

## Server

If you want to build services that accept Signed Request you use [`decentraland-crypto-middleware`](https://github.com/decentraland/decentraland-crypto-middleware)

## Develop

If you want to contribute make you will need to setup `husky` otherwise your commit may fail because is not following the format standard

```bash
  npm run husky-setup
```
