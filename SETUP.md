# Налаштування сайту + CMS (Decap) через GitHub

Сайт зібрано на легкому генераторі **Eleventy**. Блог редагується через **Decap CMS**
(адмінка за адресою `сайт/admin`), вхід — через **GitHub**.

Готовий сайт збирається в теку `_site/` (її не треба коммітити — Netlify збере сам).

---

## Локальний перегляд (на своєму комп'ютері)

```bash
npm install        # один раз
npm run dev        # запустить http://localhost:8080
```

Щоб тестувати саму адмінку локально — в окремому терміналі:
```bash
npx decap-server
```
і тимчасово розкоментуй `local_backend: true` у `src/admin/config.yml`.

---

## Крок 1. Залити код у GitHub

1. Створи новий репозиторій на GitHub (напр. `kaplun-site`), приватний або публічний.
2. У теці проєкту:
```bash
git init
git add .
git commit -m "Перший коміт"
git branch -M main
git remote add origin https://github.com/ТВІЙ-ЛОГІН/kaplun-site.git
git push -u origin main
```

## Крок 2. Підключити Netlify

1. Netlify → **Add new site → Import an existing project** → вибери GitHub-репо.
2. Build command і publish уже задані в `netlify.toml`
   (`npm run build`, публікація з `_site`) — нічого міняти не треба.
3. **Deploy**. Отримаєш адресу типу `https://щось.netlify.app`.
4. У файлах заміни всі `YOUR-DOMAIN` на цю адресу (у `src/index.html`,
   `src/_includes/base.njk`, `src/blog.njk`) — для коректних посилань і SEO.

## Крок 3. Вписати репо в адмінку

У `src/admin/config.yml` заміни:
```yml
repo: OWNER/REPO     →     repo: ТВІЙ-ЛОГІН/kaplun-site
```
Закоміть і запуш.

## Крок 4. Увімкнути вхід через GitHub (OAuth)

1. **GitHub** → Settings → Developer settings → **OAuth Apps** → **New OAuth App**:
   - Homepage URL: `https://твій-сайт.netlify.app`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
   - Створи → скопіюй **Client ID** і згенеруй **Client Secret**.
2. **Netlify** → твій сайт → **Site configuration → Access & security → OAuth**
   (або «Authentication / OAuth») → **Install provider → GitHub** →
   встав Client ID і Client Secret.

Тепер на `https://твій-сайт.netlify.app/admin` працює кнопка **Login with GitHub**.

## Крок 5. Дати доступ Саші

1. Створи Саші GitHub-акаунт (або хай створить сам — це безкоштовно й раз).
2. У репозиторії: **Settings → Collaborators → Add people** → додай його акаунт.
3. Саша приймає запрошення на пошту.

---

## Як Саша публікує статтю

1. Заходить на `https://твій-сайт.netlify.app/admin`
2. **Login with GitHub**
3. **Статті блогу → New** → заповнює заголовок, дату, категорію, короткий опис, текст,
   за бажанням вставляє картинки.
4. **Publish**. За ~1 хвилину Netlify пересобирає сайт — стаття жива.

Тебе смикати не треба.

---

## Структура проєкту

```
src/
  index.html          ← головна сторінка (готова верстка)
  styles.css, script.js
  assets/             ← фото, дипломи (+ uploads/ для картинок зі статей)
  blog.njk            ← сторінка-список блогу
  posts/
    trivoga.md        ← стаття (приклад)
    posts.json        ← спільні налаштування статей
  _includes/
    base.njk          ← каркас (шапка/футер)
    post.njk          ← шаблон статті
  admin/
    index.html        ← Decap CMS
    config.yml        ← налаштування CMS
.eleventy.js          ← конфіг генератора
netlify.toml          ← як Netlify збирає сайт
```

Нову статтю можна додати або через адмінку, або вручну — створити файл у `src/posts/`.
