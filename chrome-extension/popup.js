// ContentLoop — popup script
// Loads BYOK key from chrome.storage, scrapes current tab for article text,
// shows formats picker, calls /api/generate on contentloop-puce.vercel.app.

const API_BASE = "https://contentloop-puce.vercel.app";

const FORMATS = [
  { id: "twitter_thread", label: "X thread" },
  { id: "linkedin_post", label: "LinkedIn" },
  { id: "instagram_caption", label: "IG caption" },
  { id: "newsletter", label: "Newsletter" },
  { id: "shorts_scripts", label: "Shorts" },
  { id: "carousel_slides", label: "Carousel" },
  { id: "reddit_post", label: "Reddit" },
];

const $ = (id) => document.getElementById(id);

const els = {
  setup: $("setup-needed"),
  ready: $("ready"),
  keyInput: $("key-input"),
  saveKey: $("save-key"),
  settingsLink: $("settings-link"),
  pageTitle: $("page-title"),
  pageMeta: $("page-meta"),
  formatGrid: $("format-grid"),
  generate: $("generate"),
  resultWrap: $("result-wrap"),
  resultFormat: $("result-format"),
  result: $("result"),
  copy: $("copy"),
  error: $("error"),
};

const state = {
  key: "",
  selected: new Set(["twitter_thread", "linkedin_post"]),
  pageText: "",
  pageTitle: "",
};

/* ─────────────────────────── boot ─────────────────────────── */

async function boot() {
  const { byokKey } = await chrome.storage.local.get(["byokKey"]);
  state.key = byokKey ?? "";

  if (!state.key) {
    els.setup.classList.remove("hidden");
    els.keyInput.focus();
  } else {
    els.ready.classList.remove("hidden");
    renderFormats();
    await loadPageInfo();
  }
}

/* ─────────────────────────── key setup ─────────────────────────── */

els.saveKey.addEventListener("click", saveKey);
els.keyInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveKey();
});

async function saveKey() {
  const v = els.keyInput.value.trim();
  if (!v.startsWith("sk-ant-")) {
    showError("Key should start with sk-ant-…");
    return;
  }
  await chrome.storage.local.set({ byokKey: v });
  state.key = v;
  els.setup.classList.add("hidden");
  els.ready.classList.remove("hidden");
  renderFormats();
  await loadPageInfo();
}

els.settingsLink.addEventListener("click", async (e) => {
  e.preventDefault();
  if (state.key) {
    if (!confirm("Reset your API key?")) return;
    await chrome.storage.local.remove("byokKey");
    state.key = "";
    els.ready.classList.add("hidden");
    els.setup.classList.remove("hidden");
    els.keyInput.value = "";
    els.keyInput.focus();
  } else {
    els.keyInput.focus();
  }
});

/* ─────────────────────────── formats ─────────────────────────── */

function renderFormats() {
  els.formatGrid.innerHTML = "";
  for (const f of FORMATS) {
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = state.selected.has(f.id);
    cb.addEventListener("change", () => {
      if (cb.checked) state.selected.add(f.id);
      else state.selected.delete(f.id);
      label.classList.toggle("on", cb.checked);
      updateGenerateButton();
    });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(f.label));
    if (cb.checked) label.classList.add("on");
    els.formatGrid.appendChild(label);
  }
  updateGenerateButton();
}

function updateGenerateButton() {
  els.generate.disabled =
    state.selected.size === 0 || state.pageText.length < 120;
}

/* ─────────────────────────── page scrape ─────────────────────────── */

async function loadPageInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    els.pageTitle.textContent = "No active tab";
    return;
  }
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const candidates = ["article", "main", "[role=main]", "body"];
        let root = document.body;
        for (const sel of candidates) {
          const node = document.querySelector(sel);
          if (node && node.innerText.trim().length > 200) {
            root = node;
            break;
          }
        }
        const blocks = [];
        for (const el of root.querySelectorAll(
          "h1, h2, h3, h4, p, li, blockquote, pre"
        )) {
          const t = el.textContent?.trim();
          if (t && t.length > 0) blocks.push(t);
        }
        return {
          title: document.title,
          url: location.href,
          text: blocks.join("\n\n").slice(0, 30000),
        };
      },
    });
    state.pageText = result.result.text;
    state.pageTitle = result.result.title;
    els.pageTitle.textContent = state.pageTitle || "Untitled page";
    els.pageMeta.textContent = `${state.pageText.length.toLocaleString()} chars · ${new URL(result.result.url).hostname}`;
    updateGenerateButton();
    if (state.pageText.length < 120) {
      showError(
        "Couldn't extract enough text from this page. Try opening the actual article."
      );
    } else {
      hideError();
    }
  } catch (e) {
    els.pageTitle.textContent = "Can't scrape this tab";
    els.pageMeta.textContent = String(e?.message ?? e);
  }
}

/* ─────────────────────────── generate ─────────────────────────── */

els.generate.addEventListener("click", generate);

async function generate() {
  hideError();
  els.generate.disabled = true;
  els.generate.textContent = "Generating…";
  els.resultWrap.classList.add("hidden");

  try {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: state.pageText,
        formats: Array.from(state.selected),
        apiKey: state.key,
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      showError(data.error ?? `HTTP ${res.status}`);
      return;
    }
    const first = data.results.find((r) => r.ok) ?? data.results[0];
    if (!first) {
      showError("No result returned.");
      return;
    }
    els.resultFormat.textContent =
      FORMATS.find((f) => f.id === first.formatId)?.label ?? first.formatId;
    els.result.textContent = first.text ?? first.error ?? "(empty)";
    els.resultWrap.classList.remove("hidden");
  } catch (e) {
    showError(e?.message ?? "Network error");
  } finally {
    els.generate.disabled = false;
    els.generate.textContent = "Generate";
    updateGenerateButton();
  }
}

els.copy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.result.textContent ?? "");
    els.copy.textContent = "Copied";
    setTimeout(() => (els.copy.textContent = "Copy"), 1500);
  } catch {
    /* ignore */
  }
});

/* ─────────────────────────── helpers ─────────────────────────── */

function showError(msg) {
  els.error.textContent = msg;
  els.error.classList.remove("hidden");
}
function hideError() {
  els.error.classList.add("hidden");
}

boot();
