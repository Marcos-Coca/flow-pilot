import { createContext, useContext, useState, type ReactNode } from "react";

interface PlaygroundRunContextValue {
  currentRunId: string | null;
  errorMessage: string | null;
  isExecuting: boolean;
  setCurrentRunId: (runId: string | null) => void;
  setErrorMessage: (message: string | null) => void;
  setIsExecuting: (isExecuting: boolean) => void;
}

const PlaygroundRunContext = createContext<PlaygroundRunContextValue | null>(
  null,
);

export function PlaygroundRunProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  return (
    <PlaygroundRunContext.Provider
      value={{
        currentRunId,
        errorMessage,
        isExecuting,
        setCurrentRunId,
        setErrorMessage,
        setIsExecuting,
      }}
    >
      {children}
    </PlaygroundRunContext.Provider>
  );
}

export function usePlaygroundRun() {
  const context = useContext(PlaygroundRunContext);

  if (!context) {
    throw new Error("usePlaygroundRun must be used within PlaygroundRunProvider.");
  }

  return context;
}
