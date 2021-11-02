# decentraland-crypto-fetch

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

## Server

If you want to build services that accept Signed Request you use [`decentraland-crypto-middleware`](https://github.com/decentraland/decentraland-crypto-middleware)

## Develop

If you want to contribute make you will need to setup `husky` otherwise your commit may fail because is not following the format standard

```bash
  npm run husky-setup
```
