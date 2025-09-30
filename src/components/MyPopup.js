import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { useCopilotContext } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";

export function MyPopup() {
  const { appendMessage, setMessages } = useCopilotContext();

  const handleReset = () => {
    // Clear local messages
    setMessages([]);

    // Send reset() to backend
    appendMessage({
      role: "user",
      content: "reset()",
    });
  };

  return (
    <CopilotPopup
      instructions="Ask me anything..."
      labels={{ title: "AI Assistant" }}
      appendButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <button class="copilotKitMessageControlButton" aria-label="Reset session" title="Reset session"
            style={{
              marginLeft: "18px",
              padding: "14px 18px",
              border: "10px solid #ccc",
              borderRadius: "6px",
              background: "red",
              cursor: "pointer"
            }}
            onClick={handleReset}
          >
            Reset
          </button>
        </>
      )}
    />
  );
}

