// src/theme/Root.js
import React from "react";
import { CopilotProvider } from "@copilotkit/react-core";

export default function Root({ children }) {
  return (
    <CopilotProvider
      publicApiKey={process.env.NEXT_PUBLIC_COPILOT_API_KEY} // or hardcode your key
    >
      {children}
    </CopilotProvider>
  );
}

