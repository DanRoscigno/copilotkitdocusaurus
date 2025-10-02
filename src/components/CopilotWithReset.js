import React from "react";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotContext, useCopilotChat } from "@copilotkit/react-core";

export default function CopilotWithReset({
  markdownTagRenderers,
  RenderActionExecutionMessage,
}) {
  const { setThreadId } = useCopilotContext();
  const { reset: resetChat } = useCopilotChat();

  const handleReset = async () => {
    try {
      // 1️⃣ Reset backend
      // const res = await fetch("/reset", { method: "POST" });
      // if (!res.ok) throw new Error(`Reset failed: ${res.status}`);

      // 2️⃣ Generate a new thread ID
      const newThreadId = crypto.randomUUID();
      setThreadId(newThreadId);
      //reset();

      // 3️⃣ Reset frontend chat messages
      resetChat();

      console.log("✅ Backend reset + new thread ID set + frontend cleared");
    } catch (err) {
      console.error("❌ Reset failed:", err);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* CopilotPopup with all your existing props */}
        <CopilotPopup
          labels={{
            title: "StarRocks Assistant",
            placeholder: "Ask a question, or to reset push the reset button to the lower right...",
            initial:
              "AI generated answers are based on docs and other sources. Please test answers in non-production environments.",
          }}
          defaultOpen={false}
          markdownTagRenderers={markdownTagRenderers}
          RenderActionExecutionMessage={RenderActionExecutionMessage}
          style={{ flexGrow: 1 }}
        />

        {/* Inline Reset button */}
        <button
          className="copilotkitButton"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "32px",
            padding: "0 12px",
            fontSize: "14px",
            fontWeight: "500",
            borderRadius: "6px",
            flexShrink: 0,
          }}
          onClick={handleReset}
          title="Reset chat and start a new thread"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            style={{ marginRight: "4px", verticalAlign: "middle" }}
          >
            <path d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 1 0-.908-.418A6 6 0 1 0 8 2v1z" />
            <path d="M8 0v3h3" />
          </svg>
          Reset
        </button>
      </div>
    </div>
  );
}
