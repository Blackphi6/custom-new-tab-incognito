const urlInput = document.getElementById("url");
const incognitoInput = document.getElementById("incognitoUrl");
const focusBox = document.getElementById("focus");
const msg = document.getElementById("msg");

chrome.storage.local.get({ url: "https://g.ai", incognitoUrl: "", focus: true }, ({ url, incognitoUrl, focus }) => {
  urlInput.value = url;
  incognitoInput.value = incognitoUrl;
  focusBox.checked = focus;
  urlInput.select();
});

// チェックボックスは変更と同時に保存(保存ボタンはURL用)
focusBox.addEventListener("change", () => {
  chrome.storage.local.set({ focus: focusBox.checked });
});

// http/https のみ許可(javascript: 等の実行を防ぐ)
function normalize(raw) {
  const s = raw.trim();
  if (!s) return null;
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

function save() {
  const url = normalize(urlInput.value);
  if (!url) {
    msg.textContent = "新しいタブには http(s) の有効なURLを入力してください";
    return;
  }
  // シークレット用は空欄なら通常と同じURLを使う
  const incognitoRaw = incognitoInput.value.trim();
  const incognitoUrl = incognitoRaw ? normalize(incognitoRaw) : "";
  if (incognitoUrl === null) {
    msg.textContent = "シークレット用は http(s) の有効なURLか空欄にしてください";
    return;
  }
  chrome.storage.local.set({ url, incognitoUrl }, () => {
    urlInput.value = url;
    incognitoInput.value = incognitoUrl;
    msg.textContent = "保存しました";
  });
}

document.getElementById("save").addEventListener("click", save);
for (const el of [urlInput, incognitoInput]) {
  el.addEventListener("keydown", (e) => { if (e.key === "Enter") save(); });
}
