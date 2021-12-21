/// <reference path="../src/@types/core-js.d.ts" />
import yargs from "yargs";
import colors from "colors";
import { resolve } from "path";
import { readFileSync } from "fs";
import fetch, { Request, Headers } from "node-fetch";
import { signedFetchFactory, SignedRequestInit } from "../src";
import type { AuthIdentity } from "dcl-crypto";

const parser = yargs
  .usage(
    "Fetch the contents of the URL and sign the request with and identity if there is any"
  )
  .option("method", {
    alias: "X",
    description:
      "Specifies a custom request method to use when communicating with the HTTP server.",
    default: "GET",
    choices: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
  })
  .options("include", {
    alias: "i",
    type: "boolean",
    description:
      "Include the HTTP response headers in the output. The HTTP response headers can include things like server name, cookies, date of the document, HTTP version and more...",
  })
  .option("identity", {
    description: "Path to identity.json file",
    type: "string",
  })
  .option("json", {
    description: "Send and recieve data as json",
    type: "boolean",
  })
  .option("header", {
    alias: "H",
    type: "array",
    description: "Request header",
  })
  .options("data", {
    alias: "d",
    type: "string",
    description:
      "Sends the specified data in a POST request to the HTTP server",
  })
  .options("no-color", {
    type: "boolean",
    description: "Disabled color output",
  });

const args = parser.parse();

// Disabled colors
if (args["no-color"]) {
  colors.disable();
}

// Print help
if (args.h || args.help) {
  parser.showHelp();
  process.exit(0);
}

// Parse URL
const url = new URL(args._[0] as any);

// Parse Identity
const readOption = (value: string) => {
  if (value.startsWith("@")) {
    const identityPath = "./" + value.slice(1);
    const absolutePath = resolve(process.cwd(), identityPath);
    return readFileSync(absolutePath, "utf-8");
  } else {
    return value;
  }
};

let identity: AuthIdentity | undefined = undefined;
if (args.identity) {
  const value = readOption(args.identity);
  try {
    identity = JSON.parse(value);
  } catch (err) {
    console.error(colors.red(`Unspected identity format: ` + err.message));
    process.exit(1);
  }
}

Promise.resolve()
  .then(async () => {
    const signedFetch = signedFetchFactory({ fetch, Request, Headers } as any);
    const init: SignedRequestInit = { identity };

    if (args.method) {
      init.method = String(args.method || "GET").toLowerCase();
    }

    const headers: globalThis.Headers = new Headers() as any;
    if (args.header && args.header.length > 0) {
      for (const h of args.header) {
        const header = String(h);
        const separator = header.indexOf(":");
        const key = header.slice(0, separator).trim();
        const value = header.slice(separator + 1).trim();
        headers.append(key, value);
      }
    }

    if (args.json) {
      headers.append("Content-Type", "application/json");
    }

    init.headers = headers;

    if (args.data) {
      init.body = readOption(args.data);
    }

    const response = await signedFetch(url, init);

    // Print headers
    if (args.include) {
      console.log(response.status, colors.green(response.statusText));
      response.headers.forEach((value, key) => {
        console.log(colors.blue(key.toLowerCase() + ":"), colors.green(value));
      });
    }

    const body = await response.text();
    console.log();
    if (args.json) {
      try {
        const json = JSON.parse(body);
        console.log(JSON.stringify(json, null, 2));
      } catch {
        console.log(body);
      }
    } else {
      console.log(body);
    }
  })
  .catch((err) => {
    console.error(colors.red(err.message));
    if (err.stack) {
      err.stack
        .split("/n")
        .slice(0)
        .forEach((line: string) => {
          console.error(colors.green(line));
        });
    }
    process.exit(1);
  });
