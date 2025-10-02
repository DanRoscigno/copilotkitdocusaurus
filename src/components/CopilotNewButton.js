import { InputProps, CopilotPopup } from "@copilotkit/react-ui";
import { CopilotKit, useCopilotContext, useCopilotChat } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

export default function CopilotNewButton({ inProgress, onSend, isVisible }) {
  const { setThreadId } = useCopilotContext();
  const { reset: resetChat } = useCopilotChat();

  const handleReset = () => {
    // Generate a new thread ID
    const newThreadId = crypto.randomUUID();
    setThreadId(newThreadId);

    // Reset frontend chat messages
    resetChat();
  };

  const handleSubmit = (value) => {
    if (value.trim()) onSend(value);
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
        placeholder="Ask your question here, or reset with the button to the right..."
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
        onClick={(e) => {
          const input = e.currentTarget.previousElementSibling;
          handleSubmit(input.value);
          input.value = "";
        }}
      >
        Ask
      </button>
      <button
        disabled={inProgress}
        className={buttonStyle}
        onClick={() => {
          handleReset();
        }}
      >
        Start a new chat
      </button>

    </div>
  );
}
