# ISO Chatbot - Customizable Widget

A embeddable AI chatbot widget built for Isomorphic, fully customizable via MongoDB Atlas and API data payloads.

## 🚀 Overview

The chatbot UI components dynamically adapt based on configuration received from MongoDB Atlas documents via `botUIConfigs` and root bot settings.

---

## ⚙️ MongoDB Document Schema (`botUIConfigs`)

The widget supports direct ingestion of MongoDB documents:

```json
{
  "_id": "6a97bb88eabe0901e52bb290",
  "botId": "ISOBot",
  "botName": "ISO Bot",
  "updatedSince": "2026-09-01T07:45:06.258Z",
  "greetingMessage": [
    "Hi! I’m Atom, your AI assistant. I specialize in helping students with their questions and solving common academic or technology-related issues. How can I assist you today?"
  ],
  "botActive": true,
  "customForms": [ ... ],
  "botUIConfigs": {
    "botThemeColor": "#00306D",
    "botChatStartImage": "https://bbh-product-bucket.s3.us-east-2.amazonaws.com/a04ac944-0efc-4f92-84cd-9463c94f0505.png",
    "botResponseBackgroundColor": "#EFEFEF",
    "userQueryBackgroundColor": "#EFEFEF",
    "botResponseFontColor": "",
    "userQueryFontColor": "",
    "bgColor": "#ffffff",
    "logoUrl": "https://bbh-product-bucket.s3.us-east-2.amazonaws.com/a04ac944-0efc-4f92-84cd-9463c94f0505.png",
    "botHeaderText": "ISO AI",
    "DefaultEmptyMessage": "",
    "helpNotificationRenderTime": 10000,
    "helpNotificationRenderMsg": "Hi! I am CoolBot, an AI chatbot. I can provide answers to your technology questions and resources to resolve some of the most common issues.",
    "idleStatMessages": [
      { "message": "I’m waiting for your next question", "time": 180 },
      { "message": "Since there was no response from your end, hence we are ending the chat session. Please re initiate the chat for further support.", "time": 240 }
    ],
    "chatPosition": "fixed",
    "chatPositionLeft": "auto",
    "chatAlignmentLeft": false,
    "chatPositionRight": "30px",
    "chatPositionTop": "auto",
    "chatPositionBottom": "20px",
    "chatIconWidth": "90",
    "chatIconHeight": "90",
    "chatMobileIconWidth": "70",
    "chatMobileIconHeight": "70",
    "chatMobileVerticalIconWidth": "90",
    "chatMobileVerticalIconHeight": "90",
    "chatIconAltText": "Chat with Us",
    "chatIconTitleText": "Chat with Us",
    "allowMultiLangSupport": false,
    "demoBackgroundUrl": "",
    "likeIcon": "https://bbh-product-bucket.s3.us-east-2.amazonaws.com/dba2acac-c841-47b7-be3f-106ed4b66fef.png",
    "dislikeIcon": "https://bbh-product-bucket.s3.us-east-2.amazonaws.com/a91652f3-c1f1-4396-8aab-45793777ef09.png",
    "botChatSubmitButton": false,
    "isChatOpened": false,
    "transferFormDelay": 5,
    "showThumbUpDownFeedbackform": true,
    "showHelpButton": true,
    "helpButtonUrl": "https://vsc.blackbelthelp.com/help",
    "poweredBy": "AI powered by <span>Isomorphic</span>",
    "notifications": []
  }
}
```

---

## 🎨 Component Customization Mapping

| Component | `botUIConfigs` Properties | Description |
|---|---|---|
| **Launcher Toggle Button** | `botChatStartImage`, `chatIconWidth`, `chatIconHeight`, `chatMobileIconWidth`, `chatMobileIconHeight`, `chatIconAltText`, `chatIconTitleText` | Custom circular avatar/image, responsive width & height on desktop and mobile screens, accessibility alt/title text. |
| **Placement & Alignment** | `chatPosition`, `chatPositionBottom`, `chatPositionTop`, `chatPositionRight`, `chatPositionLeft`, `chatAlignmentLeft` | Fixed positioning, left or right alignment, customizable margins. |
| **Theme & Window Styling** | `botThemeColor`, `bgColor`, `demoBackgroundUrl` | Header and primary button colors, chat window background, optional background wallpaper image. |
| **Header Bar** | `botHeaderText`, `logoUrl`, `showHelpButton`, `helpButtonUrl`, `botActive` | Custom header title, avatar image, help button linking to external support documentation, online/offline status dot. |
| **Message Bubbles** | `botResponseBackgroundColor`, `botResponseFontColor`, `userQueryBackgroundColor`, `userQueryFontColor` | Distinct background colors and contrast-aware typography for bot and user message bubbles. |
| **Greeting Messages** | `greetingMessage` | Sequential initial messages sent by the bot on launch. |
| **Proactive Help Notification** | `helpNotificationRenderTime`, `helpNotificationRenderMsg` | Callout speech bubble rendered next to the launcher after the specified millisecond delay with dismiss button. |
| **Thumbs Up/Down Feedback** | `showThumbUpDownFeedbackform`, `likeIcon`, `dislikeIcon` | Interactive feedback row under each bot response with custom icons and feedback acknowledgement. |
| **Inactivity / Idle Warnings** | `idleStatMessages` | Progressive idle warning messages triggered by user inactivity, with automatic session timeout and restart option. |
| **Custom Interactive Forms** | `customForms`, `transferFormDelay` | In-chat dynamic forms for call transfer and post surveys with text inputs, 5-star ratings, and **Download Transcript** feature. |
| **Branding Footer** | `poweredBy` | Customizable HTML branding snippet in the footer. |
| **Input Area** | `DefaultEmptyMessage`, `botChatSubmitButton` | Custom input placeholder, visibility control for submit button (Enter key send or button send). |

---

## 🔌 Embed Script for Clients (Single Tag)

Clients only need to add a single `<script>` tag to their HTML:

```html
<script src="chatbot.js"></script>
```

Or with an explicit API endpoint / bot ID if desired:

```html
<script src="chatbot.js" data-api-url="/api/bot-config" data-bot-id="ISOBot"></script>
```

### ⚡ How It Works Internally:
1. **API Call First in `chatbot.js`**:
   `chatbot.js` immediately fetches the MongoDB Atlas configuration from `/api/bot-config?botId=ISOBot` before mounting the UI.
2. **Dynamic UI Setup**:
   It applies `botUIConfigs` (colors, header, start image, launcher sizing, idle messages, feedback icons, and forms).
3. **Welcome Message on Bot Open**:
   As soon as the user opens the bot, the welcome message is fetched from `botUIConfigs.welcomeMessage` (or `greetingMessage`) and displayed immediately.
4. **Isolated CSS with `iso-` Prefix**:
   All CSS classes, IDs, CSS variables, and animation keyframes are uniquely namespaced with `iso-` (e.g., `.iso-container`, `.iso-window`, `.iso-header`, `--iso-primary`, etc.) to prevent style collisions with the client's website.

---

## 💬 Customizable Welcome Messages in `botUIConfigs`

You can customize the welcome message directly within `botUIConfigs`:

```json
{
  "botUIConfigs": {
    "welcomeMessage": "Hi! I'm Atom, your AI assistant. How can I help you today?",
    "botThemeColor": "#00306D",
    ...
  }
}
```

> **Note**: If `welcomeMessage` is an array of strings (or `greetingMessage`), each message will be displayed sequentially as soon as the user opens the chatbot widget.

---

## 🤖 Backend Chat Query API

Every message submitted by the user is automatically sent to your backend chat API (`/api/chat` or customizable via `data-chat-api="/api/chat"`).

### Request Payload Sent by `chatbot.js`:
```json
{
  "query": "How do I register for courses?",
  "botId": "ISOBot",
  "tenantId": "defaultTenant",
  "teanantId": "defaultTenant",
  "history": [
    { "sender": "bot", "text": "Hi! How can I assist you today?" }
  ]
}
```

### Expected Response from Backend:
Your backend can return either a JSON object or plain text:
```json
{
  "response": "Course registration opens on Monday. You can register via your student portal.",
  "quickReplies": [
    "Portal Login Help",
    "Academic Deadlines"
  ]
}
```

> **Supported response fields**:
> The widget automatically checks `response`, `reply`, `message`, `answer`, or `text`, and displays the response in the chat bubble.


