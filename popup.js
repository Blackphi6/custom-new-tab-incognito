const input = document.getElementById("url");
const msg = document.getElementById("msg");

chrome.storage.local.get({ url: "https://g.ai" }, ({ url }) => {
  input.value = url;
  input.select();
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
