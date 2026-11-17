/* ===== הגדרות: ערכו רק את הבלוק הזה ===== */
const CONFIG = {
  OWNER: "USER",                 // שם המשתמש שלכם ב-GitHub
  REPO: "REPO",                  // שם המאגר
  APP_NAME: "חנות אפליקציות",
  EMAIL: "you@gmail.com",
  UPDATES_FORM_URL: "",          // קישור ל-Google Forms להרשמה לעדכונים (אפשר להשאיר ריק)
  CONTACT_FORM_ACTION: ""        // כתובת מ-Formspree וכו' (אם ריק - נפתח מייל)
};

document.querySelectorAll("[data-app-name]").forEach(e => e.textContent = CONFIG.APP_NAME);
document.getElementById("mail-link").href = "mailto:" + CONFIG.EMAIL;
const upd = document.getElementById("updates-link");
if (CONFIG.UPDATES_FORM_URL) upd.href = CONFIG.UPDATES_FORM_URL; else upd.parentElement.remove();

const GH = `https://github.com/${CONFIG.OWNER}/${CONFIG.REPO}`;
const clean = md => DOMPurify.sanitize(marked.parse(md || ""));
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

async function loadRelease() {
  const box = document.getElementById("release");
  try {
    const r = await fetch(`https://api.github.com/repos/${CONFIG.OWNER}/${CONFIG.REPO}/releases/latest`);
    if (!r.ok) throw new Error(r.status);
    const rel = await r.json();
    const apk = (rel.assets || []).find(a => /\.(apk|xapk|apkm)$/i.test(a.name));
    const date = new Date(rel.published_at).toLocaleDateString("he-IL");
    box.innerHTML =
      `<h3>גרסה ${esc(rel.tag_name)} <small>(${date})</small></h3>` +
      (apk ? `<p><a class="btn" href="${esc(apk.browser_download_url)}">הורדת ${esc(apk.name)}</a></p>` : "") +
      `<div class="prose">${clean(rel.body)}</div>` +
      `<p><a href="${esc(rel.html_url)}">לדף הגרסאות ב-GitHub</a></p>`;
  } catch (e) {
    box.innerHTML = `<a href="${GH}/releases/latest">לדף ההורדות ב-GitHub</a>`;
  }
}

async function loadGuide() {
  const box = document.getElementById("guide-content");
  try {
    const r = await fetch("User_Guide.md");
    if (!r.ok) throw new Error(r.status);
    box.innerHTML = clean(await r.text());
  } catch (e) {
    box.innerHTML = `<a href="${GH}/blob/main/User_Guide.md">קריאת המדריך ב-GitHub</a>`;
  }
}

const form = document.getElementById("contact-form");
form.addEventListener("submit", async ev => {
  ev.preventDefault();
  const st = document.getElementById("form-status");
  const d = new FormData(form);
  if (!CONFIG.CONTACT_FORM_ACTION) {
    location.href = `mailto:${CONFIG.EMAIL}?subject=${encodeURIComponent("הודעה מהאתר")}&body=${encodeURIComponent(d.get("message") + "\n\n" + d.get("name") + " " + d.get("email"))}`;
    return;
  }
  try {
    const r = await fetch(CONFIG.CONTACT_FORM_ACTION, {method: "POST", body: d, headers: {Accept: "application/json"}});
    if (!r.ok) throw new Error();
    st.textContent = "ההודעה נשלחה, תודה!"; form.reset();
  } catch (e) { st.textContent = "השליחה נכשלה. אפשר לכתוב לנו ישירות במייל."; }
});

loadRelease();
loadGuide();
