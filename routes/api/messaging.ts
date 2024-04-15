import type { Handlers, FreshContext } from "$fresh/server.ts";
import { messagingApi, MessageEvent } from "npm:@line/bot-sdk@8.4.0";
import type { ClientConfig } from "npm:@line/bot-sdk@8.4.0";
import OpenAI from "https://deno.land/x/openai@v4.33.1/mod.ts";

const config: ClientConfig = {
    channelAccessToken: "YOUR_CHANNEL_ACCESS_TOKEN",
    channelSecret: "YOUR_CHANNEL_SECRET",
};
const client = new messagingApi.MessagingApiClient(config);

const ai = new OpenAI();

export const handler: Handlers =  {
  async POST(_req: Request, _ctx: FreshContext): Promise<Response> {
    const body = await _req.json(); 
    const event: MessageEvent = body.events[0];
    const chatCompletion = await ai.chat.completions.create({
      messages: [{ role: "user", content: "tell me a joke about dinosaurs" }],
      model: "gpt-4-1106-preview",
    });
    const completion = chatCompletion.choices[0].message.content;
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: completion,
        },
      ],
    });
    return new Response(null, { status: 204 });
  }
};
