import React from "react";
import { CopilotPopup } from "@copilotkit/react-ui";

export default function CopilotPopupWidget() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 1000,
      }}
    >
      <CopilotPopup
        defaultOpen={false} // start minimized
        instructions="You are a helpful assistant for docs visitors."
        labels={{
          title: "Ask AI",
          placeholder: "Ask me about the docs...",
        }}
      />
    </div>
  );
}

