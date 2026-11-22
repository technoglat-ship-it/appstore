/* ===== הגדרות: ערכו רק את הבלוק הזה ===== */
const CONFIG = {
  OWNER: "",                     // ריק = זיהוי אוטומטי מכתובת האתר
  REPO: "",                      // ריק = זיהוי אוטומטי מכתובת האתר
  APP_NAME: "חנות אפליקציות",
  EMAIL: "technoglat@gmail.com",
  UPDATES_FORM_URL: "",          // קישור ל-Google Forms להרשמה לעדכונים (אפשר להשאיר ריק)
  CONTACT_FORM_ACTION: "",       // כתובת מ-Formspree וכו' (אם ריק - נפתח מייל)
  APK_NAME: ""                   // שם קובץ ה-APK המדויק ב-Release (גיבוי להורדה ישירה)
};

if (!CONFIG.OWNER || !CONFIG.REPO) {
  const h = location.hostname.split(".");
  if (h.length === 3 && h[1] === "github" && h[2] === "io") {
    CONFIG.OWNER = CONFIG.OWNER || h[0];
    CONFIG.REPO = CONFIG.REPO || (location.pathname.split("/").filter(x => x && !x.includes("."))[0] || location.hostname);
  }
}

document.querySelectorAll("[data-app-name]").forEach(e => e.textContent = CONFIG.APP_NAME);
document.getElementById("mail-link").href = "mailto:" + CONFIG.EMAIL;
const upd = document.getElementById("updates-link");
if (CONFIG.UPDATES_FORM_URL) upd.href = CONFIG.UPDATES_FORM_URL; else upd.parentElement.remove();

const GH = `https://github.com/${CONFIG.OWNER}/${CONFIG.REPO}`;
const clean = md => DOMPurify.sanitize(marked.parse(md || ""));
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

async function loadRelease() {
  const box = document.getElementById("release");
  const direct = name => `${GH}/releases/latest/download/${encodeURIComponent(name)}`;
  try {
    const r = await fetch(`https://api.github.com/repos/${CONFIG.OWNER}/${CONFIG.REPO}/releases/latest`);
    if (!r.ok) throw new Error(r.status);
    const rel = await r.json();
    const apk = (rel.assets || []).find(a => /\.(apk|xapk|apkm)$/i.test(a.name));
    const date = new Date(rel.published_at).toLocaleDateString("he-IL");
    box.innerHTML =
      `<h3>גרסה ${esc(rel.tag_name)} <small>(${date})</small></h3>` +
      (apk ? `<p><a class="btn" href="${esc(apk.browser_download_url)}" download>הורד</a></p>` : "<p>אין קובץ להורדה בגרסה זו.</p>") +
      `<div class="prose">${clean(rel.body)}</div>`;
  } catch (e) {
    box.innerHTML = CONFIG.APK_NAME
      ? `<p><a class="btn" href="${esc(direct(CONFIG.APK_NAME))}" download>הורד</a></p>`
      : "<p>לא ניתן לטעון את ההורדה כרגע. נסו שוב בעוד כמה דקות.</p>";
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
