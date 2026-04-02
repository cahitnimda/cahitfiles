(function () {
  "use strict";

  var sessionId = "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2);
  var messages = [];
  var isLoading = false;
  var isOpen = false;

  var chatbotSettings = { language: 'en', position: 'right' };

  document.addEventListener("DOMContentLoaded", function () {
    if (window.location.search.indexOf("disable_funnel=1") !== -1) return;
    fetch('/api/chatbot-settings')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        chatbotSettings.language = d.language || 'en';
        chatbotSettings.position = d.position || 'right';
        createChatWidget();
      })
      .catch(function() {
        createChatWidget();
      });
  });

  function createChatWidget() {
    var container = document.createElement("div");
    container.id = "cahit-chatbot";
    container.innerHTML = getChatBubbleHTML();
    document.body.appendChild(container);

    var bubble = document.getElementById("chatbot-bubble");
    var panel = document.getElementById("chatbot-panel");
    var isRtlPage = document.documentElement.classList.contains('is-rtl');
    var pos = chatbotSettings.position || 'right';
    if (isRtlPage) pos = 'left';

    if (pos === 'left') {
      bubble.style.left = '1.5rem';
      bubble.style.right = 'auto';
      panel.style.left = '1.5rem';
      panel.style.right = 'auto';
    } else {
      bubble.style.right = '1.5rem';
      bubble.style.left = 'auto';
      panel.style.right = '1.5rem';
      panel.style.left = 'auto';
    }

    if (chatbotSettings.language === 'ar') {
      panel.setAttribute('dir', 'rtl');
      var headerTitle = panel.querySelector('.chatbot-header-title');
      var headerSub = panel.querySelector('.chatbot-header-subtitle');
      var inputEl = document.getElementById('chatbot-input');
      if (headerTitle) headerTitle.textContent = 'مساعد كاهيت';
      if (headerSub) headerSub.textContent = 'اسألنا أي شيء';
      if (inputEl) inputEl.placeholder = 'اكتب رسالتك...';
    }

    bindEvents();
  }

  function getChatBubbleHTML() {
    return (
      '<button id="chatbot-bubble" class="chatbot-bubble" data-testid="button-chatbot-open" aria-label="Open chat">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>' +
      '<span id="chatbot-pulse" class="chatbot-pulse"></span>' +
      "</button>" +
      '<div id="chatbot-panel" class="chatbot-panel hidden" data-testid="panel-chatbot">' +
      '<div class="chatbot-header">' +
      '<div class="chatbot-header-avatar">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>' +
      "</div>" +
      '<div class="chatbot-header-info">' +
      '<h3 class="chatbot-header-title">Cahit Assistant</h3>' +
      '<p class="chatbot-header-subtitle">Ask us anything</p>' +
      "</div>" +
      '<button id="chatbot-close" class="chatbot-close" data-testid="button-chatbot-close" aria-label="Close chat">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' +
      "</button>" +
      "</div>" +
      '<div id="chatbot-messages" class="chatbot-messages" data-testid="chatbot-messages"></div>' +
      '<div class="chatbot-input-area">' +
      '<div class="chatbot-input-row">' +
      '<input id="chatbot-input" type="text" placeholder="Type your message..." class="chatbot-input" data-testid="input-chatbot-message" />' +
      '<button id="chatbot-send" class="chatbot-send" data-testid="button-chatbot-send" aria-label="Send message" disabled>' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>' +
      "</button>" +
      "</div>" +
      '<p class="chatbot-powered">Powered by Cahit Intelligence</p>' +
      "</div>" +
      "</div>"
    );
  }

  function bindEvents() {
    var bubble = document.getElementById("chatbot-bubble");
    var panel = document.getElementById("chatbot-panel");
    var closeBtn = document.getElementById("chatbot-close");
    var input = document.getElementById("chatbot-input");
    var sendBtn = document.getElementById("chatbot-send");

    bubble.addEventListener("click", function () {
      isOpen = true;
      bubble.classList.add("hidden");
      panel.classList.remove("hidden");
      input.focus();
    });

    closeBtn.addEventListener("click", function () {
      isOpen = false;
      panel.classList.add("hidden");
      bubble.classList.remove("hidden");
    });

    input.addEventListener("input", function () {
      sendBtn.disabled = !input.value.trim() || isLoading;
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    sendBtn.addEventListener("click", function () {
      sendMessage();
    });
  }

  function sendMessage() {
    var input = document.getElementById("chatbot-input");
    var sendBtn = document.getElementById("chatbot-send");
    var text = input.value.trim();

    if (!text || isLoading) return;

    input.value = "";
    sendBtn.disabled = true;
    isLoading = true;

    messages.push({ role: "user", content: text });
    renderMessages();
    showLoading();

    var pulse = document.getElementById("chatbot-pulse");
    if (pulse) pulse.classList.add("hidden");

    var ajaxUrl =
      typeof cahitData !== "undefined" && cahitData.ajaxUrl
        ? cahitData.ajaxUrl
        : "/api/chat";

    var useWpAjax = typeof cahitData !== "undefined" && cahitData.ajaxUrl;

    var fetchOptions;

    if (useWpAjax) {
      var formData = new FormData();
      formData.append("action", "cahit_chat");
      formData.append("message", text);
      formData.append("sessionId", sessionId);
      if (cahitData.nonce) {
        formData.append("nonce", cahitData.nonce);
      }
      fetchOptions = { method: "POST", body: formData };
    } else {
      fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId, message: text }),
      };
    }

    fetch(ajaxUrl, fetchOptions)
      .then(function (res) {
        if (!res.ok) throw new Error("Chat request failed");
        return res.json();
      })
      .then(function (data) {
        var reply = data.reply || (data.data && data.data.reply);
        if (!reply) throw new Error("No reply");
        messages.push({ role: "assistant", content: reply });
      })
      .catch(function () {
        messages.push({
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again or contact us directly at ctc@cahitcontracting.com.",
        });
      })
      .finally(function () {
        isLoading = false;
        renderMessages();
        var inputEl = document.getElementById("chatbot-input");
        inputEl.disabled = false;
        inputEl.focus();
      });

    input.disabled = true;
  }

  function renderMessages() {
    var container = document.getElementById("chatbot-messages");
    var html = "";

    messages.forEach(function (msg) {
      if (msg.role === "user") {
        html +=
          '<div class="chatbot-msg chatbot-msg-user">' +
          '<div class="chatbot-msg-bubble chatbot-msg-bubble-user">' +
          escapeHtml(msg.content) +
          "</div>" +
          '<div class="chatbot-msg-avatar chatbot-msg-avatar-user">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
          "</div>" +
          "</div>";
      } else {
        html +=
          '<div class="chatbot-msg chatbot-msg-assistant">' +
          '<div class="chatbot-msg-avatar chatbot-msg-avatar-bot">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>' +
          "</div>" +
          '<div class="chatbot-msg-bubble chatbot-msg-bubble-assistant">' +
          escapeHtml(msg.content) +
          "</div>" +
          "</div>";
      }
    });

    if (isLoading) {
      html +=
        '<div class="chatbot-msg chatbot-msg-assistant">' +
        '<div class="chatbot-msg-avatar chatbot-msg-avatar-bot">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>' +
        "</div>" +
        '<div class="chatbot-msg-bubble chatbot-msg-bubble-assistant">' +
        '<div class="chatbot-loading">' +
        '<span class="chatbot-dot" style="animation-delay:0ms"></span>' +
        '<span class="chatbot-dot" style="animation-delay:150ms"></span>' +
        '<span class="chatbot-dot" style="animation-delay:300ms"></span>' +
        "</div>" +
        "</div>" +
        "</div>";
    }

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }

  function showLoading() {
    renderMessages();
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
})();
