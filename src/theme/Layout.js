// src/theme/Layout.js
import React from "react";
import Layout from "@theme-original/Layout";
import CopilotPopupWidget from "../components/CopilotPopupWidget";

export default function LayoutWrapper(props) {
  return (
    <>
      <Layout {...props} />
      <CopilotPopupWidget />
    </>
  );
}

