import { createSlackWebClient } from "@midday/app-store/slack";
import type { SlackEvent } from "@slack/bolt";
import { waitUntil } from "@vercel/functions";
import { fileShared } from "./file";
import { assistantThreadMessage, assistantThreadStarted } from "./thread";

export async function handleSlackEvent(
  event: SlackEvent,
  options: { token: string; teamId: string; botId: string },
) {
  const client = createSlackWebClient({
    token: options.token,
  });

  if (event.type === "assistant_thread_started") {
    waitUntil(assistantThreadStarted(event, client));
    return;
  }

  if (event.subtype === "file_share") {
    waitUntil(fileShared(event, options));
    return;
  }

  if (
    event.text &&
    event.type === "message" &&
    event.channel_type === "im" &&
    !event.bot_id && // Ignore bot messages
    event.subtype !== "assistant_app_thread"
  ) {
    waitUntil(assistantThreadMessage(event, client, options));
    return;
  }
}