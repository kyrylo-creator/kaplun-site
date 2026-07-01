// Викликається кнопкою «Опублікувати зміни» в /admin.
// Запускає ОДНУ збірку сайту через Netlify Build Hook — щоб опублікувати
// одразу всі накопичені відгуки/зміни, а не робити білд на кожен окремо.
//
// Захист: перевіряємо GitHub-токен, який Decap CMS зберігає після входу.
// Смикнути збірку може лише той, хто має право запису в репозиторій.
//
// Налаштування — env-змінна BUILD_HOOK_URL
// (Netlify → Site configuration → Environment variables), значення —
// URL білд-хука з Site configuration → Build & deploy → Build hooks.

const REPO = "kyrylo-creator/kaplun-site";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "method not allowed" };
  }

  const hook = process.env.BUILD_HOOK_URL;
  if (!hook) {
    console.error("Missing BUILD_HOOK_URL");
    return { statusCode: 500, body: "config missing" };
  }

  // Токен GitHub з заголовка Authorization: token <...>
  const auth = event.headers.authorization || event.headers.Authorization || "";
  const token = auth.replace(/^(token|bearer)\s+/i, "").trim();
  if (!token) {
    return { statusCode: 401, body: "no token" };
  }

  // Перевіряємо, що токен має право запису саме в цей репозиторій.
  const repoResp = await fetch(`https://api.github.com/repos/${REPO}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "sashkopsy-admin",
    },
  });
  if (!repoResp.ok) {
    return { statusCode: 403, body: "no access" };
  }
  const repo = await repoResp.json();
  if (!repo.permissions || !repo.permissions.push) {
    return { statusCode: 403, body: "no push access" };
  }

  // Усе гаразд — запускаємо збірку.
  const hookResp = await fetch(hook, { method: "POST" });
  if (!hookResp.ok) {
    console.error("Build hook failed:", hookResp.status);
    return { statusCode: 502, body: "build hook failed" };
  }

  return { statusCode: 200, body: "ok" };
};
