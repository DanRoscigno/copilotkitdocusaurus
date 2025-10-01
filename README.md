
### From ChatGTP

I had a heck of a time adding a reset button. ChatGPT helped:

> Ah, I see exactly what’s happening. When we wrapped `CopilotPopup` inside a custom flex container to insert the Reset button, we essentially **created a new wrapper around the original component**. That part is fine, but the way we were **forcing a remount using `key={resetCount}`** can interfere with some of the internal props and customizations if they aren’t passed consistently.

Also, in my previous examples, I didn’t include your **existing props** like `markdownTagRenderers` and `RenderActionExecutionMessage`. If you omit them when rendering the `CopilotPopup`, they simply won’t work.

---

### ✅ Correct way to combine your existing customizations with the Reset button

You can **render the Reset button inline** while still passing all your props:

```jsx
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
```

---

### 🔹 Key points

1. **Pass all your existing props** (`markdownTagRenderers`, `RenderActionExecutionMessage`, `defaultOpen`, etc.) to the `CopilotPopup`. Otherwise, they won’t work.
2. **Keep `key={resetCount}`** to force a remount on reset, but don’t remove your customizations — just include them in the JSX.
3. **Style the wrapper with `flexGrow: 1`** on the popup so it fills the available space and the button sits inline.
4. **No DOM injection needed**, so all props and custom renderers work normally.

---

This way, your **Reset button is inline** and your **existing customizations still function perfectly**.

If you want, I can also show a **version that doesn’t use the `key` trick** but still resets both backend and frontend state, so the popup never fully remounts — which is slightly cleaner and avoids potential side effects with complex custom renderers.

Do you want me to do that?



Although there is no official "CopilotPopup" plugin specifically for Docusaurus, you can implement a chatbot popup using the CopilotKit library. This involves installing the @copilotkit/react-ui package, adding the necessary provider components, and rendering the <CopilotPopup> component in your Docusaurus site. 
Prerequisites
You will need an existing Docusaurus site and a provider for your AI copilot. This guide assumes you are using CopilotKit for the UI components.
1. Install CopilotKit packages
First, install the CopilotKit React UI and a framework package, such as @copilotkit/react-core, in your Docusaurus project. 
sh
npm install @copilotkit/react-ui @copilotkit/react-core
2. Wrap your Docusaurus site with the CopilotKit provider
To make the AI functionality available throughout your site, you need to wrap your application with the <CopilotKit> provider component. You can do this by swizzling a Docusaurus component, such as Root.js or Layout.js, to modify the root of your React component tree. 
Example: Modifying the Root.js component
Swizzle the Root component. Run the following command in your terminal to create a local copy of the Root component file.
sh
npm run swizzle @docusaurus/core Root -- --eject
Add the provider. Edit the generated src/theme/Root.js file to include the <CopilotKit> provider.
js
// src/theme/Root.js
import React from 'react';
import { CopilotKit } from "@copilotkit/react-core";

function Root({ children }) {
  return (
    <CopilotKit url="/api/copilotkit">
      {children}
    </CopilotKit>
  );
}

export default Root;
Note: The url prop should point to your backend API endpoint for the copilot.
3. Add the CopilotPopup component
Next, render the <CopilotPopup> component in your application's layout. A good place for this is the Layout component, which is responsible for the persistent structure of your site.
Example: Adding to the Layout component
Swizzle the Layout component.
sh
npm run swizzle @docusaurus/theme-classic Layout -- --eject
Add the popup. Edit the generated src/theme/Layout.js file to include the <CopilotPopup> component, for example, within the main content area.
js
// src/theme/Layout.js
import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import { CopilotPopup } from "@copilotkit/react-ui";

export default function Layout(props) {
  return (
    <OriginalLayout {...props}>
      {props.children}
      <CopilotPopup
        labels={{
          title: "Your Docusaurus Assistant",
          initial: "Ask me a question about our docs!"
        }}
        defaultOpen={true}
      />
    </OriginalLayout>
  );
}
Note: You can customize the popup's appearance and behavior using the available props. 
4. Configure your backend and deploy
This setup provides the front-end components for the popup, but you still need a working backend that the CopilotKit provider can connect to. 
Set up your CopilotKit backend as detailed in the official CopilotKit documentation.
Configure your Docusaurus site to correctly proxy requests to your backend or host it separately.
Redeploy your site to see the changes. The copilot popup should now be visible and functional. 
Alternative integration options
If the CopilotKit approach is too complex, you may find other solutions to integrate an AI chatbot:
Third-party services: Some services, like CrawlChat and Q Answer, offer dedicated Docusaurus integrations where you copy a code snippet from their dashboard and paste it into your docusaurus.config.js file.
Custom React component: As Docusaurus is built with React, you can create a custom React component for the popup using any library and place it within a swizzled Layout.js component. 

# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
