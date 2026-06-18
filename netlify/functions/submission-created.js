// Netlify викликає цю функцію автоматично після кожного сабміту форми.
// Беремо дані з payload і шлемо в Telegram-групу.
// Налаштування — через env-змінні TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID
// (Netlify → Site configuration → Environment variables).

const LANG_NAMES = { uk: "Українська", en: "English", ru: "Русский" };

exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "bad json" };
  }

  const payload = body.payload || {};
  const data = payload.data || {};
  const formName = payload.form_name || "contact";

  if (formName !== "contact") {
    return { statusCode: 200, body: "skipped" };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
    return { statusCode: 500, body: "config missing" };
  }

  const time = new Date(payload.created_at || Date.now()).toLocaleString(
    "uk-UA",
    { timeZone: "Europe/Dublin" }
  );

  // Збираємо інфу про джерело трафіку
  const lang = LANG_NAMES[data.lang] || data.lang || "—";
  const sourceLines = [];
  if (data.page_url) sourceLines.push(`Сторінка: ${data.page_url}`);
  if (data.referrer && data.referrer !== "direct") {
    sourceLines.push(`Звідки: ${data.referrer}`);
  } else if (data.referrer === "direct") {
    sourceLines.push("Звідки: пряме відвідування");
  }
  const utmFields = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const utmPresent = utmFields.filter((k) => data[k]);
  if (utmPresent.length) {
    sourceLines.push(
      "UTM: " + utmPresent.map((k) => `${k.replace("utm_", "")}=${data[k]}`).join(" · ")
    );
  }

  const text = [
    "🆕 Новий запит з сайту",
    "",
    `Імʼя: ${data.name || "—"}`,
    `Телефон: ${data.phone || "—"}`,
    `Повідомлення: ${data.message || "—"}`,
    "",
    `Мова форми: ${lang}`,
    ...sourceLines,
    "",
    `Час: ${time}`,
  ].join("\n");

  const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error("Telegram error:", err);
    return { statusCode: 502, body: "telegram failed" };
  }

  return { statusCode: 200, body: "ok" };
};
