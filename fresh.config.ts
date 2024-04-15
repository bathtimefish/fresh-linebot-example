import { defineConfig } from "$fresh/server.ts";

const keyPath = "/home/ubuntu/resources/cert/privkey.pem";
const certPath = "/home/ubuntu/resources/cert/fullchain.pem";
const key = await Deno.readTextFile(keyPath);
const cert = await Deno.readTextFile(certPath);

export default defineConfig({
  key,
  cert,
});

//export default defineConfig({});
