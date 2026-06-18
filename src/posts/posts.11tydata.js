// Спільні налаштування всіх статей блогу.
// Permalink — динамічний: EN-статті йдуть на /blog/<slug>/,
// UK на /uk/blog/<slug>/, RU на /ru/blog/<slug>/

module.exports = {
  layout: "post.njk",
  tags: "post",
  permalink: (data) => {
    const lang = data.lang || "uk";
    const slug = data.page.fileSlug;
    return lang === "en"
      ? `/blog/${slug}/`
      : `/${lang}/blog/${slug}/`;
  },
};
