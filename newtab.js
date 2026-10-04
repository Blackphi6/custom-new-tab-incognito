chrome.storage.local.get({ url: "https://g.ai", focus: true }, ({ url, focus }) => {
  chrome.tabs.getCurrent((tab) => {
    if (!tab) {
      location.replace(url);
    } else if (focus) {
      chrome.tabs.update(tab.id, { url });
    } else {
      // update だとアドレスバーのフォーカスが残るため、別タブで開き直してページにフォーカスを渡す
      chrome.tabs.create({ windowId: tab.windowId, index: tab.index, url, active: true }, () => {
        chrome.tabs.remove(tab.id);
      });
    }
  });
});
