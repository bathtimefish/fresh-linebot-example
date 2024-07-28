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

declare interface DifyChatMessageRequest {
  // deno-lint-ignore ban-types
  inputs: {};
  query: string;
  response_mode: "blocking";
  user: string;
  conversation_id?: string;
}

declare type conversationIds = { userId: string, conversationId: string }[];
let conversationIds: conversationIds = [];
// deno-lint-ignore no-inferrable-types
let invervalId: number = 0;

const getConversationId = (event: MessageEvent): string|null => {
  const userId = event.source.userId;
  if (!userId) return null;
  if (conversationIds.length === 0) return null;
  for (const conversationId of conversationIds) {
    if (conversationId.userId === userId) {
      return conversationId.conversationId;
    }
  }
  return null;
}

const setConversationId = (event: MessageEvent, conversationId: string): void => {
  const userId = event.source.userId;
  if (!userId) return;
  conversationIds.push({ userId, conversationId });
  if (invervalId) clearInterval(invervalId);
  for (let i = 0; i < conversationIds.length; i++) {
    if (conversationIds[i].userId === userId) {
      conversationIds.splice(i, 1);
      break;
    }
  }
  invervalId = setTimeout(() => {
    conversationIds = [];
  }, 1000 * 60 * 10);
  console.log(conversationIds);
};


const config: ClientConfig = {
    channelAccessToken: "YOUR_CHANNEL_ACCESS_TOKEN",
    channelSecret: "YOUR_CHANNEL_SECRET",
};
const client = new messagingApi.MessagingApiClient(config);

export const handler: Handlers =  {
  async POST(_req: Request, _ctx: FreshContext): Promise<Response> {
    const body = await _req.json(); 
    const event: MessageEvent = body.events[0];
    const textMessage = event.message as TextEventMessage;
    console.log(textMessage.text);
    // request to Dify API
    const requestData: DifyChatMessageRequest = {
      inputs: {},
      query: textMessage.text,
      response_mode: "blocking",
      user: "line-bot",
    };
    // get conversation id
    const conversationId = getConversationId(event);
    console.log(conversationId);
    if (conversationId) requestData["conversation_id"] = conversationId;
    const resp = await fetch("https://api.dify.ai/v1/chat-messages", {
      method: "POST",
      headers: {
        "Authorization": "Bearer ENTER-YOUR-SECRET-KEY",
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
    // set conversation id
    setConversationId(event, res.conversation_id);
    return new Response(null, { status: 204 });
  }
};

