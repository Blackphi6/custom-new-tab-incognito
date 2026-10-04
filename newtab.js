chrome.storage.local.get({ url: "https://g.ai" }, ({ url }) => {
  location.replace(url);
});
