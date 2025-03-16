import { SERVER_URL } from "@/api/config";
import { createContext } from "react";
import { AssistantCloud, AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { useState, useCallback, useContext, useEffect } from "react";

const PUBLIC_ASSISTANT_BASE_URL = import.meta.env
  .VITE_PUBLIC_ASSISTANT_BASE_URL;
const ASSISTANT_UI_KEY = import.meta.env.VITE_ASSISTANT_UI_KEY;

interface RuntimeContextType {
  refreshRuntime: () => void;
}

const RuntimeContext = createContext<RuntimeContextType | undefined>(undefined);

// Hook to access the runtime refresh function
export function useRuntimeRefresh() {
  const context = useContext(RuntimeContext);
  if (!context) {
    throw new Error("useRuntimeRefresh must be used within a RuntimeProvider");
  }
  return context.refreshRuntime;
}

export function RuntimeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Add a state to force re-renders
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to trigger a refresh
  const refreshRuntime = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
    return user?.user?.id;
  };

  const userId = getUserId();

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
    authToken: () => getAuthToken(),
  });

  const runtime = useChatRuntime({
    cloud,
    api: `${SERVER_URL}/api/ai/chat`,
    credentials: "include"
  });

  const contextValue = {
    refreshRuntime,
  };

  return (
    <RuntimeContext.Provider value={contextValue}>
      <AssistantRuntimeProvider runtime={runtime}>
        {children}
      </AssistantRuntimeProvider>
    </RuntimeContext.Provider>
  );
}
