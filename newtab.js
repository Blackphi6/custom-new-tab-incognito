chrome.storage.local.get({ url: "https://g.ai", focus: true }, ({ url, focus }) => {
  if (!focus) {
    location.replace(url);
    return;
  }
  chrome.tabs.getCurrent((tab) => {
    if (tab) chrome.tabs.update(tab.id, { url });
    else location.replace(url);
  });
});
