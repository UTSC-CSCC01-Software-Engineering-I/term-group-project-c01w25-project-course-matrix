import fetch from "node-fetch";

// Polyfill the global fetch for Pinecone to use
globalThis.fetch = fetch as unknown as WindowOrWorkerGlobalScope["fetch"];
globalThis.TransformStream = require("stream/web").TransformStream;
globalThis.TextEncoder = require("util").TextEncoder;
globalThis.TextDecoder = require("util").TextDecoder;
globalThis.ReadableStream = require("stream/web").ReadableStream;
globalThis.TransformStream = require("stream/web").TransformStream;
globalThis.WritableStream = require("stream/web").WritableStream;
