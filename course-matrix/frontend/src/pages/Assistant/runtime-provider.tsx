import { SERVER_URL } from "@/api/config";
import { AssistantCloud, AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";

const PUBLIC_ASSISTANT_BASE_URL = import.meta.env
  .VITE_PUBLIC_ASSISTANT_BASE_URL;
const ASSISTANT_UI_KEY = import.meta.env.VITE_ASSISTANT_UI_KEY;

const user = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
const userId = user?.user?.id;

const getAuthToken = async () => {
  const client = new AssistantCloud({
    apiKey: ASSISTANT_UI_KEY!,
    userId,
    workspaceId: userId,
  });
  const { token } = await client.auth.tokens.create();
  return token;
};

const cloud = new AssistantCloud({
  baseUrl: PUBLIC_ASSISTANT_BASE_URL!,
  // authToken: () =>
  //   fetch("/api/assistant-ui-token", { method: "POST" })
  //     .then((r) => r.json())
  //     .then((r) => r.token),
  authToken: () => getAuthToken(),
});

export function RuntimeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtime = useChatRuntime({
    cloud,
    api: `${SERVER_URL}/api/ai/chat`,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
