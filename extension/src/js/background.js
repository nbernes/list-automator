chrome.runtime.onMessage.addListener((message, sender) => {
  chrome.tabs.sendMessage(sender.tab.id, message);
});