const input = document.getElementById("url");
const msg = document.getElementById("msg");

const focusBox = document.getElementById("focus");

chrome.storage.local.get({ url: "https://g.ai", focus: true }, ({ url, focus }) => {
  input.value = url;
  focusBox.checked = focus;
  input.select();
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
  const url = normalize(input.value);
  if (!url) {
    msg.textContent = "http(s) の有効なURLを入力してください";
    return;
  }
  chrome.storage.local.set({ url }, () => {
    input.value = url;
    msg.textContent = "保存しました";
  });
}

document.getElementById("save").addEventListener("click", save);
input.addEventListener("keydown", (e) => { if (e.key === "Enter") save(); });
