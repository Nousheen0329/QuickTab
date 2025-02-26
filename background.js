chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get("autoOpenLinks", (data) => {
    if (data.autoOpenLinks && data.autoOpenLinks.length > 0) {
      data.autoOpenLinks.forEach((url) => {
        chrome.tabs.create({ url });
      });
    }
  });
});
