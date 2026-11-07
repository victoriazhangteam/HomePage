/* Victoria Zhang — site behaviour: language switch, mobile menu, contact form. */
(function () {
  var FORM_EMAIL = "victoria@victoriazhangteam.com"; // form submissions are emailed here (via FormSubmit.co)
  var root = document.documentElement;

  // ---------- language ----------
  function setLang(lang) {
    var zh = lang === "zh";
    root.classList.toggle("lang-zh", zh);
    root.setAttribute("lang", zh ? "zh-Hans" : "en");
    document.querySelectorAll("[data-ph-zh]").forEach(function (el) {
      if (!el.dataset.phEn) el.dataset.phEn = el.getAttribute("placeholder") || "";
      el.setAttribute("placeholder", zh ? el.dataset.phZh : el.dataset.phEn);
    });
    document.querySelectorAll("option[data-zh]").forEach(function (o) {
      if (!o.dataset.en) o.dataset.en = o.textContent;
      o.textContent = zh ? o.dataset.zh : o.dataset.en;
    });
    var t = document.querySelector("meta[name='title-zh']");
    if (t) { if (!root.dataset.titleEn) root.dataset.titleEn = document.title; document.title = zh ? t.content : root.dataset.titleEn; }
    try { localStorage.setItem("vz-lang", lang); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem("vz-lang"); } catch (e) {}
  if (!saved && /^zh/i.test(navigator.language || "")) saved = "zh";
  setLang(saved || "en");
  document.querySelectorAll(".lang-btn").forEach(function (b) {
    b.addEventListener("click", function () { setLang(root.classList.contains("lang-zh") ? "en" : "zh"); });
  });

  // ---------- mobile menu ----------
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector("nav.main");
  if (toggle && nav) toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // ---------- contact / selling-plan form ----------
  var form = document.querySelector("form.lead");
  if (form) {
    var params = new URLSearchParams(location.search);
    if (params.get("guide") === "1" || location.hash === "#guide") { var g = form.querySelector("#f-guide"); if (g) g.checked = true; }
    var topic = params.get("about");
    if (topic) { var m = form.querySelector("#f-message"); if (m && !m.value) m.value = "I'm interested in " + topic + ". "; }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var status = form.querySelector(".form-status");
      var zh = root.classList.contains("lang-zh");
      var btn = form.querySelector("button[type=submit]");
      if (form.querySelector(".hp input").value) return; // spam trap
      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== "_honey") data[k] = v; });
      data._subject = "New website lead: " + (data.name || "") + (data.guide ? " (+ Selling Strategy Guide)" : "");
      data._template = "table";
      data["Site language"] = zh ? "Chinese" : "English";
      btn.disabled = true;
      fetch("https://formsubmit.co/ajax/" + FORM_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (String(res.success) !== "true") throw new Error(res.message || "failed");
        status.hidden = false; status.className = "form-status ok";
        status.textContent = zh ? "谢谢！您的信息已发送，Victoria 会在一个工作日内与您联系。" : "Thank you! Your details were sent. Victoria will be in touch within one business day.";
        form.reset();
      }).catch(function () {
        status.hidden = false; status.className = "form-status err";
        status.textContent = zh ? "发送失败。请直接致电 416.838.9626 或发邮件至 " + FORM_EMAIL + "。" : "Your message didn't go through. Please call 416.838.9626 or email " + FORM_EMAIL + ".";
      }).finally(function () { btn.disabled = false; });
    });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
