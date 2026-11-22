/* כתובת ה-Worker שלכם ב-Cloudflare (בלי / בסוף) */
const API_URL = "https://YOUR-WORKER.workers.dev";
const TOKEN_KEY = "site_token";

function getSession() {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return null;
    const p = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (p.exp * 1000 < Date.now()) { localStorage.removeItem(TOKEN_KEY); return null; }
    return { token: t, email: p.email, role: p.role };
  } catch (e) { return null; }
}

async function api(path, body, token) {
  const r = await fetch(API_URL + path, {
    method: "POST",
    headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: "Bearer " + token } : {}),
    body: JSON.stringify(body || {})
  });
  const j = await r.json().catch(() => ({ error: "שגיאת שרת" }));
  if (!r.ok) throw new Error(j.error || "שגיאה");
  return j;
}

function renderAuthLinks() {
  const box = document.getElementById("auth-links");
  if (!box) return;
  const s = getSession();
  box.innerHTML = s
    ? (s.role === "admin" ? '<a href="admin.html">ניהול</a>' : "") + '<a href="#" id="logout">התנתקות</a>'
    : '<a href="account.html">התחברות / הרשמה</a>';
  const lo = document.getElementById("logout");
  if (lo) lo.onclick = e => { e.preventDefault(); localStorage.removeItem(TOKEN_KEY); location.reload(); };
}
document.addEventListener("DOMContentLoaded", renderAuthLinks);
