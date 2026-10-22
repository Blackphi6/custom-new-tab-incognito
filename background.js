const DEFAULT_URL = "https://g.ai";
const NEW_TAB_URLS = ["chrome://newtab/", "chrome://new-tab-page/", "chrome-search://local-ntp/local-ntp.html"];

// onCreated と onUpdated の両方が発火するため、同じタブを二重に処理しない
const handled = new Set();

// シークレットは chrome_url_overrides が効かないため、タブ側を直接書き換える
async function redirectIfIncognitoNewTab(tab) {
  if (!tab.incognito || handled.has(tab.id)) return;
  const current = tab.pendingUrl || tab.url || "";
  if (!NEW_TAB_URLS.includes(current)) return;
  handled.add(tab.id);

  const { url, incognitoUrl, focus, incognitoFocus } = await chrome.storage.local.get({
    url: DEFAULT_URL, incognitoUrl: "", focus: true, incognitoFocus: null,
  });
  const target = incognitoUrl || url || DEFAULT_URL;
  // シークレット用が未設定なら通常用の設定を引き継ぐ
  const shouldFocus = incognitoFocus ?? focus;
  try {
    if (shouldFocus) {
      await chrome.tabs.update(tab.id, { url: target });
    } else {
      // update だとアドレスバーのフォーカスが残るため、別タブで開き直してページにフォーカスを渡す
      await chrome.tabs.create({ windowId: tab.windowId, index: tab.index, url: target, active: true });
      await chrome.tabs.remove(tab.id);
    }
  } catch (e) {
    handled.delete(tab.id);
  }
}

chrome.tabs.onCreated.addListener(redirectIfIncognitoNewTab);
chrome.tabs.onUpdated.addListener((_id, info, tab) => {
  if (info.url || info.status) redirectIfIncognitoNewTab(tab);
});
chrome.tabs.onRemoved.addListener((id) => handled.delete(id));
