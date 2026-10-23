const DEFAULT_URL = "https://g.ai";
const NEW_TAB_URLS = ["chrome://newtab/", "chrome://new-tab-page/", "chrome-search://local-ntp/local-ntp.html"];

// onCreated / onUpdated / newtab.js からの依頼が重なるため、同じタブを二重に処理しない
const handled = new Set();

async function redirect(tab) {
  if (handled.has(tab.id)) return;
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

// シークレットは chrome_url_overrides が効かないことがあるため、タブ側を直接書き換える
function redirectIfIncognitoNewTab(tab) {
  if (!tab.incognito) return;
  const current = tab.pendingUrl || tab.url || "";
  if (NEW_TAB_URLS.includes(current)) redirect(tab);
}

chrome.tabs.onCreated.addListener(redirectIfIncognitoNewTab);
chrome.tabs.onUpdated.addListener((_id, info, tab) => {
  if (info.url || info.status) redirectIfIncognitoNewTab(tab);
});
chrome.tabs.onRemoved.addListener((id) => handled.delete(id));

// 新しいシークレットウィンドウの1枚目などで拡張の newtab.html が先に開いた場合の依頼を受ける
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type === "incognito-newtab" && sender.tab?.incognito) redirect(sender.tab);
});
