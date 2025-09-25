
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
