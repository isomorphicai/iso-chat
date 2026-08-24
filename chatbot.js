/**
 * Premium Minimalist Chatbot Widget
 * Built by Isomorphic.
 * Compatible with any website by simply injecting this single file.
 */

(function () {
  // Prevent double loading
  if (window.CustomChatbotInitialized) return;
  window.CustomChatbotInitialized = true;

  // Isometric logo SVG for Iso Bot
  const ISO_LOGO_SVG = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#isoGrad1)" stroke="rgba(255,255,255,0.4)" stroke-width="0.75" stroke-linejoin="round"/>
      <path d="M2 7V17L12 22V12L2 7Z" fill="url(#isoGrad2)" stroke="rgba(255,255,255,0.4)" stroke-width="0.75" stroke-linejoin="round"/>
      <path d="M12 12V22L22 17V7L12 12Z" fill="url(#isoGrad3)" stroke="rgba(255,255,255,0.4)" stroke-width="0.75" stroke-linejoin="round"/>
      <defs>
        <linearGradient id="isoGrad1" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#C5A059"/>
          <stop offset="100%" stop-color="#EFE6D1"/>
        </linearGradient>
        <linearGradient id="isoGrad2" x1="2" y1="7" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#0A2240"/>
          <stop offset="100%" stop-color="#16365C"/>
        </linearGradient>
        <linearGradient id="isoGrad3" x1="12" y1="12" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#C5A059"/>
          <stop offset="100%" stop-color="#0A2240"/>
        </linearGradient>
      </defs>
    </svg>
  `;

  // --------------------------------------------------------
  // 1. DEFAULT/FALLBACK CONFIGURATION
  // --------------------------------------------------------
  const DEFAULT_CONFIG = {
    botId: "isomorphic-bot",
    botName: "Iso Bot",
    companyName: "Isomorphic",
    botLogo: ISO_LOGO_SVG,
    welcomeMessage: "Hi there! I am **Iso Bot**, custom-built by **Isomorphic**.<br><br>How can I help you today?",
    placeholderText: "Message Iso Bot...",
    apiEndpoint: "", 
    configEndpoint: "", 
    persistHistory: true,
    position: "right", 
    theme: {
      primaryColor: "#0A2240",       // Dignified Academic Navy Blue
      primaryHoverColor: "#16365C",  // Primary Light Navy
      backgroundColor: "#ffffff",    
      textColor: "#1A1E24",          // Deep Navy-tinted Charcoal
      botMsgBg: "#F3F1EB",           // Warm gray/cream secondary background
      botMsgColor: "#1A1E24",
      userMsgBg: "#0A2240",          // Academic Navy
      userMsgColor: "#ffffff",
      fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
      borderRadius: "12px",          // 12px border radius to match website
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      accentColor: "#C5A059"          // Classic Antique Gold
    },
    quickReplies: [
      "What is Isomorphic? ⚡",
      "Tell me about custom bot integrations",
      "Is history saved?",
      "Talk to support"
    ]
  };

  // State management
  let config = { ...DEFAULT_CONFIG };
  let isChatOpen = false;
  let isMinimized = false;
  let isTyping = false;
  let chatHistory = [];

  // DOM references
  let widgetContainer = null;
  let chatToggle = null;
  let chatWindow = null;
  let chatBody = null;
  let textInput = null;
  let sendButton = null;

  // --------------------------------------------------------
  // 2. CONFIGURATION LOADER (MongoDB API Bridge)
  // --------------------------------------------------------
  async function loadConfiguration() {
    const currentScript = document.currentScript;
    let botId = config.botId;
    let customConfigEndpoint = config.configEndpoint;

    if (currentScript) {
      botId = currentScript.getAttribute("data-bot-id") || botId;
      customConfigEndpoint = currentScript.getAttribute("data-config-endpoint") || customConfigEndpoint;
      try {
        if (currentScript.innerHTML.trim()) {
          const inlineConfig = JSON.parse(currentScript.innerHTML);
          config = deepMerge(config, inlineConfig);
        }
      } catch (e) {
        console.warn("Chatbot: Failed to parse inline script config", e);
      }
    }

    config.botId = botId;

    if (customConfigEndpoint) {
      try {
        const fetchUrl = `${customConfigEndpoint}?botId=${encodeURIComponent(botId)}`;
        const response = await fetch(fetchUrl);
        if (response.ok) {
          const apiConfig = await response.json();
          config = deepMerge(config, apiConfig);
        }
      } catch (err) {
        console.warn("Chatbot: Error connecting to Config API. Using fallback.", err);
      }
    }

    injectStyles(config.theme, config.position);
  }

  function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  // --------------------------------------------------------
  // 3. STYLE INJECTION (CSS Variable Theming)
  // --------------------------------------------------------
  function injectStyles(theme, position) {
    const styleId = "cbot-theme-styles";
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const posLeft = position === "left" ? "24px" : "auto";
    const posRight = position === "right" ? "24px" : "auto";

    styleEl.innerHTML = `
      :root {
        --cbot-primary: ${theme.primaryColor};
        --cbot-primary-hover: ${theme.primaryHoverColor};
        --cbot-bg: ${theme.backgroundColor};
        --cbot-text: ${theme.textColor};
        --cbot-bot-msg-bg: ${theme.botMsgBg};
        --cbot-bot-msg-color: ${theme.botMsgColor};
        --cbot-user-msg-bg: ${theme.userMsgBg};
        --cbot-user-msg-color: ${theme.userMsgColor};
        --cbot-font: ${theme.fontFamily};
        --cbot-radius: ${theme.borderRadius};
        --cbot-shadow: ${theme.boxShadow};
        --cbot-accent: ${theme.accentColor};
        --cbot-pos-left: ${posLeft};
        --cbot-pos-right: ${posRight};
      }

      .cbot-scope * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: var(--cbot-font);
        -webkit-font-smoothing: antialiased;
      }

      .cbot-container {
        position: fixed;
        bottom: 24px;
        left: var(--cbot-pos-left);
        right: var(--cbot-pos-right);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      
      .cbot-container-left {
        align-items: flex-start !important;
      }

      /* Minimal Glowing Toggle */
      .cbot-toggle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background-color: var(--cbot-primary);
        color: var(--cbot-user-msg-color);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(15, 23, 42, 0.15);
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease;
        position: relative;
      }

      .cbot-toggle:hover {
        transform: scale(1.05);
        background-color: var(--cbot-primary-hover);
        box-shadow: 0 6px 24px rgba(15, 23, 42, 0.22);
      }

      .cbot-toggle:active {
        transform: scale(0.96);
      }

      .cbot-toggle svg {
        width: 24px;
        height: 24px;
        transition: transform 0.3s ease, opacity 0.25s ease;
      }

      .cbot-toggle .cbot-close-icon {
        position: absolute;
        opacity: 0;
        transform: rotate(-90deg);
      }

      .cbot-active .cbot-toggle .cbot-chat-icon {
        opacity: 0;
        transform: rotate(90deg) scale(0);
      }

      .cbot-active .cbot-toggle .cbot-close-icon {
        opacity: 1;
        transform: rotate(0) scale(1);
      }

      /* Premium Glassmorphism Chat Window */
      .cbot-window {
        width: 370px;
        height: 550px;
        max-height: calc(100vh - 100px);
        background-color: var(--cbot-bg);
        border-radius: var(--cbot-radius);
        box-shadow: var(--cbot-shadow);
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        transform: translateY(16px) scale(0.97);
        pointer-events: none;
        transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: bottom right;
        border: 1px solid rgba(0, 0, 0, 0.05);
      }
      
      .cbot-container-left .cbot-window {
        transform-origin: bottom left;
      }

      .cbot-active .cbot-window {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      /* Elegant Dark Header */
      .cbot-header {
        background-color: #0F172A; /* Fixed Deep Dark for Premium Look */
        color: #ffffff;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .cbot-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .cbot-avatar-wrapper {
        position: relative;
        width: 38px;
        height: 38px;
      }

      .cbot-header-logo {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cbot-header-logo svg {
        width: 100%;
        height: 100%;
      }

      .cbot-header-logo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }

      .cbot-status-indicator {
        width: 9px;
        height: 9px;
        background-color: var(--cbot-accent);
        border: 1.5px solid #0F172A;
        border-radius: 50%;
        position: absolute;
        bottom: 0;
        right: 0;
      }

      .cbot-header-text {
        display: flex;
        flex-direction: column;
      }

      .cbot-bot-name {
        font-weight: 600;
        font-size: 14px;
        color: #ffffff;
      }

      .cbot-bot-status {
        font-size: 10px;
        color: #94A3B8;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 1px;
      }

      .cbot-header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .cbot-header-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748B;
        transition: background-color 0.2s, color 0.2s;
      }

      .cbot-header-btn:hover {
        background-color: rgba(255, 255, 255, 0.08);
        color: #ffffff;
      }

      .cbot-header-btn svg {
        width: 16px;
        height: 16px;
      }

      /* Body Layout */
      .cbot-body {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background-color: #F8FAFC;
        scroll-behavior: smooth;
      }

      .cbot-body::-webkit-scrollbar {
        width: 4px;
      }
      .cbot-body::-webkit-scrollbar-track {
        background: transparent;
      }
      .cbot-body::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.08);
        border-radius: 2px;
      }

      /* Clean Spacing for Message Items */
      .cbot-message {
        display: flex;
        gap: 10px;
        max-width: 85%;
        opacity: 0;
        transform: translateY(8px);
        animation: cbot-fade-in-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      }

      @keyframes cbot-fade-in-up {
        to { opacity: 1; transform: translateY(0); }
      }

      .cbot-message-bot {
        align-self: flex-start;
      }

      .cbot-message-user {
        align-self: flex-end;
        flex-direction: row-reverse;
        max-width: 80%;
      }

      .cbot-msg-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        flex-shrink: 0;
        align-self: flex-end;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      .cbot-msg-avatar svg {
        width: 100%;
        height: 100%;
      }

      .cbot-msg-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cbot-msg-bubble {
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 13.5px;
        line-height: 1.5;
        position: relative;
        word-break: break-word;
      }

      .cbot-message-bot .cbot-msg-bubble {
        background-color: var(--cbot-bot-msg-bg);
        color: var(--cbot-bot-msg-color);
        border-bottom-left-radius: 3px;
        border: 1px solid rgba(0, 0, 0, 0.03);
      }

      .cbot-message-user .cbot-msg-bubble {
        background-color: var(--cbot-user-msg-bg);
        color: var(--cbot-user-msg-color);
        border-bottom-right-radius: 3px;
      }

      .cbot-msg-time {
        font-size: 9px;
        color: #94A3B8;
        margin-top: 4px;
        align-self: flex-start;
        padding-left: 2px;
      }
      
      .cbot-message-user .cbot-msg-time {
        align-self: flex-end;
        padding-right: 2px;
      }

      /* Minimal Quick Replies (Horizontal Scrolling Capsule layout) */
      .cbot-quick-replies {
        display: flex;
        gap: 6px;
        padding: 0 16px 12px 16px;
        overflow-x: auto;
        background-color: #F8FAFC;
        scrollbar-width: none;
      }

      .cbot-quick-replies::-webkit-scrollbar {
        display: none;
      }

      .cbot-quick-reply-btn {
        background-color: #ffffff;
        border: 1px solid #E2E8F0;
        color: #475569;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        font-weight: 500;
      }

      .cbot-quick-reply-btn:hover {
        background-color: var(--cbot-primary);
        color: var(--cbot-user-msg-color);
        border-color: var(--cbot-primary);
      }

      /* Clean borderless Input Panel */
      .cbot-input-area {
        padding: 14px 16px;
        border-top: 1px solid #E2E8F0;
        background-color: #ffffff;
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .cbot-input-wrapper {
        flex: 1;
        position: relative;
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 20px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        padding: 0 12px;
      }

      .cbot-input-wrapper:focus-within {
        border-color: #94A3B8;
        background-color: #ffffff;
      }

      .cbot-input-wrapper input {
        width: 100%;
        border: none;
        background: transparent;
        padding: 8px 0;
        font-size: 13.5px;
        color: #1E293B;
        outline: none;
      }

      .cbot-input-wrapper input::placeholder {
        color: #94A3B8;
      }

      .cbot-send-btn {
        background-color: var(--cbot-primary);
        color: var(--cbot-user-msg-color);
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: background-color 0.2s, transform 0.1s;
      }

      .cbot-send-btn:hover:not(:disabled) {
        background-color: var(--cbot-primary-hover);
        transform: scale(1.04);
      }
      
      .cbot-send-btn:disabled {
        background-color: #F1F5F9;
        color: #94A3B8;
        cursor: not-allowed;
      }

      .cbot-send-btn svg {
        width: 15px;
        height: 15px;
      }

      /* Typings indicator */
      .cbot-typing-indicator {
        display: flex;
        align-items: center;
        gap: 3px;
        padding: 10px 14px;
        background-color: var(--cbot-bot-msg-bg);
        border-radius: 14px;
        border-bottom-left-radius: 3px;
        width: fit-content;
        align-self: flex-start;
      }

      .cbot-typing-dot {
        width: 5px;
        height: 5px;
        background-color: #94A3B8;
        border-radius: 50%;
        animation: cbot-typing 1.4s infinite ease-in-out both;
      }

      .cbot-typing-dot:nth-child(1) { animation-delay: -0.32s; }
      .cbot-typing-dot:nth-child(2) { animation-delay: -0.16s; }

      @keyframes cbot-typing {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1.0); }
      }

      /* Typography formatting within bubbles */
      .cbot-msg-bubble a {
        color: var(--cbot-primary);
        text-decoration: underline;
        font-weight: 500;
      }
      
      .cbot-msg-bubble code {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 2px 4px;
        border-radius: 4px;
        font-size: 11.5px;
        font-family: monospace;
      }

      .cbot-msg-bubble pre {
        background-color: rgba(0, 0, 0, 0.04);
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 11px;
        overflow-x: auto;
        margin: 6px 0;
        font-family: monospace;
      }

      .cbot-msg-bubble ul, .cbot-msg-bubble ol {
        margin-left: 16px;
        margin-top: 4px;
        margin-bottom: 4px;
      }

      /* Tiny minimalist branding */
      .cbot-branding {
        font-size: 9px;
        color: #94A3B8;
        text-align: center;
        padding-bottom: 8px;
        background-color: #ffffff;
        letter-spacing: 0.2px;
      }
      
      .cbot-branding a {
        color: #64748B;
        text-decoration: none;
        font-weight: 600;
      }

      /* Mobile layout overrides */
      @media (max-width: 480px) {
        .cbot-container {
          bottom: 0 !important;
          right: 0 !important;
          left: 0 !important;
          width: 100% !important;
        }

        .cbot-toggle {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 10;
        }
        
        .cbot-container-left .cbot-toggle {
          left: 16px;
          right: auto;
        }

        .cbot-window {
          width: 100vw !important;
          height: 100vh !important;
          max-height: 100vh !important;
          border-radius: 0 !important;
          margin-bottom: 0 !important;
          position: fixed;
          top: 0;
          left: 0;
          border: none;
        }
      }
    `;
  }

  // Helper to dynamically render bot logo (as SVG elements, images, or initials fallback)
  function renderLogoHtml(logo, name) {
    if (!logo) {
      const initial = name ? name.charAt(0).toUpperCase() : "I";
      return `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#4F46E5; color:white; font-weight:bold; font-size:14px; border-radius:50%;">${initial}</div>`;
    }
    const cleanLogo = logo.trim();
    if (cleanLogo.startsWith("<svg") || cleanLogo.includes("xmlns") || cleanLogo.includes("svg")) {
      return cleanLogo;
    }
    return `<img src="${cleanLogo}" alt="${name || 'Bot'}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
  }

  // --------------------------------------------------------
  // 4. HTML MARKUP BUILDER & DOM INJECTION
  // --------------------------------------------------------
  function createChatbotDOM() {
    widgetContainer = document.createElement("div");
    widgetContainer.className = "cbot-scope cbot-container";
    if (config.position === "left") {
      widgetContainer.classList.add("cbot-container-left");
    }

    const chatIcon = `
      <svg class="cbot-chat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 2L2 7L12 12L22 7L12 2Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M2 7V17L12 22V12L2 7Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 12V22L22 17V7L12 12Z" />
      </svg>
    `;

    const closeIcon = `
      <svg class="cbot-close-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;

    const sendIcon = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    const minimizeIcon = `
      <svg class="cbot-minimize-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    `;

    widgetContainer.innerHTML = `
      <div class="cbot-window" aria-hidden="true" role="dialog">
        <!-- Header -->
        <div class="cbot-header">
          <div class="cbot-header-info">
            <div class="cbot-avatar-wrapper">
              <div class="cbot-header-logo">
                ${renderLogoHtml(config.botLogo, config.botName)}
              </div>
              <span class="cbot-status-indicator"></span>
            </div>
            <div class="cbot-header-text">
              <span class="cbot-bot-name">${config.botName}</span>
              <span class="cbot-bot-status"><span style="width: 4px; height: 4px; border-radius: 50%; background-color: var(--cbot-accent); display: inline-block;"></span>Online</span>
            </div>
          </div>
          <div class="cbot-header-actions">
            <button class="cbot-header-btn cbot-minimize-btn" title="Minimize chat" aria-label="Minimize chat">
              ${minimizeIcon}
            </button>
            <button class="cbot-header-btn cbot-close-btn" title="End conversation" aria-label="End conversation">
              ${closeIcon}
            </button>
          </div>
        </div>

        <!-- Chat Messages Container -->
        <div class="cbot-body"></div>

        <!-- Quick Replies Pills -->
        <div class="cbot-quick-replies" style="display: none;"></div>

        <!-- Chat Input Area -->
        <div class="cbot-input-area">
          <div class="cbot-input-wrapper">
            <input type="text" placeholder="${config.placeholderText}" aria-label="Type your message">
          </div>
          <button class="cbot-send-btn" disabled aria-label="Send message">
            ${sendIcon}
          </button>
        </div>

        <!-- Branding Link -->
        <div class="cbot-branding">
          Powered by <a href="https://isomorphic.co" target="_blank" rel="noopener">${config.companyName}</a>
        </div>
      </div>

      <!-- Main Toggle Button -->
      <button class="cbot-toggle" aria-label="Open chat assistant" aria-haspopup="dialog">
        ${chatIcon}
        ${closeIcon}
      </button>
    `;

    document.body.appendChild(widgetContainer);

    chatToggle = widgetContainer.querySelector(".cbot-toggle");
    chatWindow = widgetContainer.querySelector(".cbot-window");
    chatBody = widgetContainer.querySelector(".cbot-body");
    textInput = widgetContainer.querySelector(".cbot-input-area input");
    sendButton = widgetContainer.querySelector(".cbot-send-btn");

    setupEventListeners();
  }

  // --------------------------------------------------------
  // 5. EVENT HANDLERS & BINDING
  // --------------------------------------------------------
  function setupEventListeners() {
    chatToggle.addEventListener("click", handleToggleClick);

    widgetContainer.querySelector(".cbot-minimize-btn").addEventListener("click", minimizeChat);

    widgetContainer.querySelector(".cbot-close-btn").addEventListener("click", closeChat);

    textInput.addEventListener("input", () => {
      sendButton.disabled = textInput.value.trim() === "";
    });

    textInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        triggerMessageSend();
      }
    });

    sendButton.addEventListener("click", triggerMessageSend);
  }

  function minimizeChat() {
    isChatOpen = false;
    isMinimized = true;
    widgetContainer.classList.remove("cbot-active");
    chatWindow.setAttribute("aria-hidden", "true");
  }

  function closeChat() {
    isChatOpen = false;
    isMinimized = false;
    clearChatHistory(); // End current chat and wipe local history on close
    widgetContainer.classList.remove("cbot-active");
    chatWindow.setAttribute("aria-hidden", "true");
  }

  function handleToggleClick() {
    if (isChatOpen) {
      minimizeChat();
    } else {
      if (isMinimized) {
        // Resume minimized chat
        isChatOpen = true;
        isMinimized = false;
        widgetContainer.classList.add("cbot-active");
        chatWindow.setAttribute("aria-hidden", "false");
        setTimeout(scrollToBottom, 100);
        if (window.innerWidth > 480) {
          textInput.focus();
        }
      } else {
        // Start a brand new chat
        clearChatHistory();
        isChatOpen = true;
        widgetContainer.classList.add("cbot-active");
        chatWindow.setAttribute("aria-hidden", "false");
        setTimeout(scrollToBottom, 100);
        if (window.innerWidth > 480) {
          textInput.focus();
        }
      }
    }
  }

  function toggleChat(forceState) {
    if (typeof forceState === "boolean") {
      if (forceState) {
        clearChatHistory();
        isChatOpen = true;
        isMinimized = false;
        widgetContainer.classList.add("cbot-active");
        chatWindow.setAttribute("aria-hidden", "false");
        setTimeout(scrollToBottom, 100);
        if (window.innerWidth > 480) textInput.focus();
      } else {
        closeChat();
      }
    } else {
      handleToggleClick();
    }
  }

  function triggerMessageSend() {
    const text = textInput.value.trim();
    if (!text || isTyping) return;

    appendMessage("user", text);
    textInput.value = "";
    sendButton.disabled = true;
    getBotResponse(text);
  }

  // --------------------------------------------------------
  // 6. SAFE FORMATTING & RENDERING (Preserving HTML tags)
  // --------------------------------------------------------
  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Only renders the HTML node and appends it to the DOM
  function renderMessage(sender, text, isHtml = false, timestampStr = null) {
    const messageEl = document.createElement("div");
    messageEl.className = `cbot-message cbot-message-${sender}`;

    const timestamp = timestampStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let avatarHtml = "";
    if (sender === "bot") {
      avatarHtml = `<div class="cbot-msg-avatar">${renderLogoHtml(config.botLogo, config.botName)}</div>`;
    }

    // Securely escape user input, but parse bot markdown / preserve raw HTML
    let processedText = "";
    if (sender === "user") {
      processedText = escapeHTML(text);
    } else {
      processedText = isHtml ? text : parseMarkdown(text);
    }

    messageEl.innerHTML = `
      ${avatarHtml}
      <div style="display: flex; flex-direction: column;">
        <div class="cbot-msg-bubble">
          ${processedText}
        </div>
        <span class="cbot-msg-time">${timestamp}</span>
      </div>
    `;

    chatBody.appendChild(messageEl);
    scrollToBottom();
  }

  // Appends new message to chat and commits it to history storage
  function appendMessage(sender, text, isHtml = false) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    renderMessage(sender, text, isHtml, timestamp);

    if (config.persistHistory) {
      chatHistory.push({ sender, text, timestamp, isHtml });
      saveChatHistory();
    }
  }

  function showTypingIndicator() {
    if (isTyping) return;
    isTyping = true;

    const indicator = document.createElement("div");
    indicator.className = "cbot-message cbot-message-bot cbot-typing-container";
    
    indicator.innerHTML = `
      <div class="cbot-msg-avatar">${renderLogoHtml(config.botLogo, config.botName)}</div>
      <div class="cbot-typing-indicator">
        <div class="cbot-typing-dot"></div>
        <div class="cbot-typing-dot"></div>
        <div class="cbot-typing-dot"></div>
      </div>
    `;

    chatBody.appendChild(indicator);
    scrollToBottom();
  }

  // Robust Markdown Parser (Doesn't strip or escape pre-existing HTML tags)
  function parseMarkdown(text) {
    let html = text;

    // Code blocks: ```code```
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic: *text*
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links: [label](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    return html;
  }

  function removeTypingIndicator() {
    if (!isTyping) return;
    const indicator = chatBody.querySelector(".cbot-typing-container");
    if (indicator) {
      indicator.remove();
    }
    isTyping = false;
  }

  function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // --------------------------------------------------------
  // 7. BOT INTELLIGENCE & RESPONSES
  // --------------------------------------------------------
  async function getBotResponse(userMsg) {
    showTypingIndicator();
    hideQuickReplies();

    const requestPayload = {
      botId: config.botId,
      message: userMsg,
      history: chatHistory.slice(-10)
    };

    const endpoint = config.apiEndpoint || "/api/chat";

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      removeTypingIndicator();

      if (response.ok) {
        const data = await response.json();
        appendMessage("bot", data.reply || "No reply received from server.");
        
        if (data.quickReplies && data.quickReplies.length > 0) {
          showQuickReplies(data.quickReplies);
        } else {
          showQuickReplies(config.quickReplies);
        }
      } else {
        appendMessage("bot", `Error: Server responded with status ${response.status}.`);
      }
    } catch (err) {
      console.error("Chatbot API response error:", err);
      removeTypingIndicator();
      appendMessage("bot", "Unable to reach the chat server. Please check your network or try again later.");
    }
  }

  function showQuickReplies(replies) {
    const container = widgetContainer.querySelector(".cbot-quick-replies");
    if (!replies || replies.length === 0) {
      container.style.display = "none";
      return;
    }

    container.innerHTML = "";
    replies.forEach(replyText => {
      const btn = document.createElement("button");
      btn.className = "cbot-quick-reply-btn";
      btn.textContent = replyText;
      btn.addEventListener("click", () => {
        appendMessage("user", replyText);
        hideQuickReplies();
        getBotResponse(replyText);
      });
      container.appendChild(btn);
    });

    container.style.display = "flex";
    scrollToBottom();
  }

  function hideQuickReplies() {
    const container = widgetContainer.querySelector(".cbot-quick-replies");
    container.style.display = "none";
  }

  // --------------------------------------------------------
  // 8. SESSION HISTORY PERSISTENCE (localStorage)
  // --------------------------------------------------------
  function getHistoryKey() {
    return `cbot_history_${config.botId}`;
  }

  function saveChatHistory() {
    if (!config.persistHistory) return;
    localStorage.setItem(getHistoryKey(), JSON.stringify(chatHistory));
  }

  function loadChatHistory() {
    if (!config.persistHistory) return;
    const historyString = localStorage.getItem(getHistoryKey());
    if (historyString) {
      try {
        chatHistory = JSON.parse(historyString);
        if (chatHistory.length > 0) {
          chatHistory.forEach(msg => {
            renderMessage(msg.sender, msg.text, msg.isHtml, msg.timestamp);
          });
          showQuickReplies(config.quickReplies);
          return;
        }
      } catch (e) {
        console.warn("Chatbot: Error parsing saved chat history", e);
      }
    }

    appendMessage("bot", config.welcomeMessage);
    showQuickReplies(config.quickReplies);
  }

  function clearChatHistory() {
    localStorage.removeItem(getHistoryKey());
    chatHistory = [];
    chatBody.innerHTML = "";
    appendMessage("bot", config.welcomeMessage);
    showQuickReplies(config.quickReplies);
  }

  // --------------------------------------------------------
  // 9. INITIALIZATION
  // --------------------------------------------------------
  async function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
      return;
    }

    await loadConfiguration();
    createChatbotDOM();
    loadChatHistory();
  }

  init();

  // Export control interface
  window.AuraChat = {
    open: () => toggleChat(true),
    close: () => toggleChat(false),
    toggle: () => toggleChat(),
    clearHistory: () => clearChatHistory(),
    updateTheme: (newTheme) => {
      config.theme = deepMerge(config.theme, newTheme);
      injectStyles(config.theme, config.position);
    },
    updateConfig: (newConfig) => {
      config = deepMerge(config, newConfig);
      
      if (newConfig.theme || newConfig.position) {
        injectStyles(config.theme, config.position);
        if (widgetContainer) {
          if (config.position === "left") {
            widgetContainer.classList.add("cbot-container-left");
          } else {
            widgetContainer.classList.remove("cbot-container-left");
          }
        }
      }
      
      if (widgetContainer) {
        const nameEl = widgetContainer.querySelector(".cbot-bot-name");
        if (nameEl && newConfig.botName) {
          nameEl.textContent = config.botName;
        }
        
        const avatarWrapper = widgetContainer.querySelector(".cbot-avatar-wrapper");
        if (avatarWrapper && newConfig.botLogo) {
          const statusDot = avatarWrapper.querySelector(".cbot-status-indicator");
          
          avatarWrapper.innerHTML = `<div class="cbot-header-logo">${renderLogoHtml(config.botLogo, config.botName)}</div>`;
          
          if (statusDot) {
            avatarWrapper.appendChild(statusDot);
          } else {
            const newDot = document.createElement("span");
            newDot.className = "cbot-status-indicator";
            avatarWrapper.appendChild(newDot);
          }
        }
      }
    },
    sendMessage: (text) => {
      if (isChatOpen) {
        appendMessage("user", text);
        getBotResponse(text);
      }
    }
  };
})();
