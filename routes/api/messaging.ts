import type { Handlers, FreshContext } from "$fresh/server.ts";
import { messagingApi, MessageEvent } from "npm:@line/bot-sdk@8.4.0";
import type { ClientConfig } from "npm:@line/bot-sdk@8.4.0";

const config: ClientConfig = {
    channelAccessToken: "Fdp7a1SvzScSrHrpzYsnjwNyE/MOrRMbt7r2GAvzsfJ9heOZp0mjdhceEDdjr2wHkYFP0lD4kIQ5dEgaq820cjoTI6vZZYOBTJq07YNVkH4yCsjCnuX6EnuZAVtZktxN/NWX4JVI30gvNgCsJbGnUQdB04t89/1O/w1cDnyilFU=",
    channelSecret: "7efc5952c8594974f4fcda475b49bfa5",
};
const client = new messagingApi.MessagingApiClient(config);

export const handler: Handlers =  {
  async POST(_req: Request, _ctx: FreshContext): Promise<Response> {
    const body = await _req.json()
    const event: MessageEvent = body.events[0]
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: "Hello, I'm Fresh.",
        },
      ],
    });
    return new Response(null, { status: 204 });
  }
};
