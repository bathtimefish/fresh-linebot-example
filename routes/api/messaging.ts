import type { Handlers, FreshContext } from "$fresh/server.ts";
import { messagingApi, MessageEvent } from "npm:@line/bot-sdk@9.2.2";
import type { ClientConfig, TextEventMessage } from "npm:@line/bot-sdk@9.2.2";

declare interface DifyChatMessageResponse {
  event: string;
  task_id: string;
  id: string;
  message_id: string;
  conversation_id: string;
  mode: string;
  answer: string;
  metadata: {
    usage: {
      prompt_tokens: number;
      prompt_unit_price: string;
      prompt_price_unit: string;
      prompt_price: string;
      completion_tokens: number;
      completion_unit_price: string;
      completion_price_unit: string;
      completion_price: string;
      total_tokens: number;
      total_price: string;
      currency: string;
      latency: number;
    }
  },
  created_at: number; 
}

const config: ClientConfig = {
    channelAccessToken: "Fdp7a1SvzScSrHrpzYsnjwNyE/MOrRMbt7r2GAvzsfJ9heOZp0mjdhceEDdjr2wHkYFP0lD4kIQ5dEgaq820cjoTI6vZZYOBTJq07YNVkH4yCsjCnuX6EnuZAVtZktxN/NWX4JVI30gvNgCsJbGnUQdB04t89/1O/w1cDnyilFU=",
    channelSecret: "7efc5952c8594974f4fcda475b49bfa5",
};
const client = new messagingApi.MessagingApiClient(config);

export const handler: Handlers =  {
  async POST(_req: Request, _ctx: FreshContext): Promise<Response> {
    const body = await _req.json(); 
    const event: MessageEvent = body.events[0];
    const textMessage = event.message as TextEventMessage;
    console.log(textMessage.text);
    // request to Dify API
    const requestData = {
      inputs: {},
      query: textMessage.text,
      response_mode: "blocking",
      user: "line-bot",
    };
    const resp = await fetch("https://api.dify.ai/v1/chat-messages", {
      method: "POST",
      headers: {
        "Authorization": "Bearer app-DEAvRK6ASFLPbZmQ2ktDsSwh",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    const res = await resp.json() as DifyChatMessageResponse;
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: res.answer,
        },
      ],
    });
    return new Response(null, { status: 204 });
  }
};
