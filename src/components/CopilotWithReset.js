import React, { useState } from "react";
import { CopilotPopup } from "@copilotkit/react-ui";

export default function CopilotWithReset({
  markdownTagRenderers,
  RenderActionExecutionMessage,
}) {
  const [resetCount, setResetCount] = useState(0);

  const handleReset = async () => {
    try {
      // Reset backend
      const res = await fetch("/reset", { method: "POST" });
      if (!res.ok) throw new Error(`Reset failed: ${res.status}`);

      // Force frontend reset by remounting CopilotPopup
      setResetCount(prev => prev + 1);

      console.log("✅ Backend + frontend reset completed");
    } catch (err) {
      console.error("❌ Reset failed:", err);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px" }}>
      {/* Input area wrapper */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* CopilotPopup with all your existing props */}
        <CopilotPopup
          key={resetCount} // forces remount on reset
          labels={{
            title: "StarRocks Assistant",
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
          title="Reset chat and backend state"
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
