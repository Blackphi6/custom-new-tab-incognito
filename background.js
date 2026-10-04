const DEFAULT_URL = "https://g.ai";
const NEW_TAB_URLS = ["chrome://newtab/", "chrome://new-tab-page/", "chrome-search://local-ntp/local-ntp.html"];

async function getTargetUrl() {
  const { url } = await chrome.storage.local.get({ url: DEFAULT_URL });
  return url || DEFAULT_URL;
}

// シークレットは chrome_url_overrides が効かないため、タブ側を直接書き換える
async function redirectIfIncognitoNewTab(tab) {
  if (!tab.incognito) return;
  const current = tab.pendingUrl || tab.url || "";
  if (!NEW_TAB_URLS.includes(current)) return;
  const target = await getTargetUrl();
  chrome.tabs.update(tab.id, { url: target }).catch(() => {});
}

chrome.tabs.onCreated.addListener(redirectIfIncognitoNewTab);
chrome.tabs.onUpdated.addListener((_id, info, tab) => {
  if (info.url || info.status) redirectIfIncognitoNewTab(tab);
});
