import { onRequestPost as __api_send_starter_kit_js_onRequestPost } from "/root/.openclaw/workspace/agents/coder/prototypes/roami-live-itinerary-v2/site/functions/api/send-starter-kit.js"

export const routes = [
    {
      routePath: "/api/send-starter-kit",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_send_starter_kit_js_onRequestPost],
    },
  ]