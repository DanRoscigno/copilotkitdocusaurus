import React from "react";
import { useState } from "react";
import { CopilotKit, useCopilotChat } from "@copilotkit/react-core";
import {
  ButtonProps,
  useChatContext,
  CopilotPopup,
} from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import clsx from "clsx";
import ErrorBoundary from "@docusaurus/ErrorBoundary";
import {
  PageMetadata,
  SkipToContentFallbackId,
  ThemeClassNames,
} from "@docusaurus/theme-common";
import { useKeyboardNavigation } from "@docusaurus/theme-common/internal";
import SkipToContent from "@theme/SkipToContent";
import AnnouncementBar from "@theme/AnnouncementBar";
import Navbar from "@theme/Navbar";
import Footer from "@theme/Footer";
import LayoutProvider from "@theme/Layout/Provider";
import ErrorPageContent from "@theme/ErrorPageContent";
import styles from "./styles.module.css";
import { SearchDocActionView } from "@site/src/components/SearchDocActionView";
import { GeneralToolCallView } from "@site/src/components/GeneralToolCallView";

const createMarkdownTagRenderers = (originalRenderers = {}) => {
  return {
    ...originalRenderers,
    code: ({ children, className, inline, ...props }) => {
      // Handle inline code
      if (
        inline ||
        (children && typeof children === "string" && !children.includes("\n"))
      ) {
        return (
          <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">
            {children}
          </code>
        );
      }

      // Handle regular code blocks
      return (
        <pre className="bg-gray-200 p-4 rounded-md overflow-x-auto mb-4">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    },
  };
};

function MyRenderActionExecutionMessage(props) {
  const { message } = props;

  // Skip rendering if message doesn't have required properties
  if (!message || !message.name) {
    return null;
  }

  if (message.name === "search_starrocks_doc") {
    return <SearchDocActionView {...props} />;
  } else {
    return <GeneralToolCallView {...props} />;
  }
}

function Button(props) {
  const { open, setOpen } = useChatContext();
  const wrapperStyles =
    "w-24 bg-blue-500 text-white p-4 rounded-lg text-center cursor-pointer";
  return (
    <div onClick={() => setOpen(!open)} className={wrapperStyles}>
      <button
        className={`${open ? "open" : ""}`}
        aria-label={open ? "Close Chat" : "Open Chat"}
      >
        Ask AI
      </button>
    </div>
  );
}

export default function Layout(props) {
  const {
    children,
    noFooter,
    wrapperClassName,
    // Not really layout-related, but kept for convenience/retro-compatibility
    title,
    description,
  } = props;
  useKeyboardNavigation();
  return (
    // <CopilotKit publicApiKey="<ck_pub_a9b6f0cee62ab9c42692f25ccfe08e38>">
    <CopilotKit
      agent="sr_agent"
      runtimeUrl="https://ai-agent.starrocks.com/copilotkit/"
      showDevConsole={false}
    >
      <LayoutProvider>
        <PageMetadata title={title} description={description} />

        <SkipToContent />

        <AnnouncementBar />

        <Navbar />

        <div
          id={SkipToContentFallbackId}
          className={clsx(
            ThemeClassNames.wrapper.main,
            styles.mainWrapper,
            wrapperClassName
          )}
        >
          <ErrorBoundary
            fallback={(params) => <ErrorPageContent {...params} />}
          >
            {children}
          </ErrorBoundary>
        </div>

        {!noFooter && <Footer />}
        <CopilotPopup
          labels={{
            title: "StarRocks Assistant",
            initial:
              "AI generated answers are based on docs and other sources. Please test answers in non-production environments.",
          }}
          defaultOpen={true}
          markdownTagRenderers={createMarkdownTagRenderers()}
          RenderActionExecutionMessage={MyRenderActionExecutionMessage}
          Button={Button}
          Input={CustomInputWithReset}
        />
      </LayoutProvider>
    </CopilotKit>
  );
}

function CustomInputWithReset({
  inProgress,
  onSend,
  isVisible,
  onStop,
  onUpload,
}) {
  const [threadId, setThreadId] = useState("");
  const { reset } = useCopilotChat();

  const handleSubmit = (value) => {
    if (value.trim()) onSend(value);
  };


  const handleStartNewConversation = () => {
    // Generate a new, unique thread ID
    const newThreadId = crypto.randomUUID();
    useCopilotContext(newThreadId);
  };
  const wrapperStyle = "flex gap-2 p-4 border-t";
  const inputStyle =
    "flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500 disabled:bg-gray-100";
  const buttonStyle =
    "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed";

  return (
    <div className={wrapperStyle}>
      <input
        disabled={inProgress}
        type="text"
        placeholder="Ask your question here..."
        className={inputStyle}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit(e.currentTarget.value);
            e.currentTarget.value = "";
          }
        }}
      />

      <button
        disabled={inProgress}
        className={buttonStyle}
        onClick={handleStartNewConversation}
      >
        Reset
      </button>

      <button
        disabled={inProgress}
        className={buttonStyle}
        onClick={(e) => {
          const input =
            e.currentTarget.previousElementSibling.previousElementSibling;
          handleSubmit(input.value);
          input.value = "";
        }}
      >
        Ask
      </button>
    </div>
  );
}
