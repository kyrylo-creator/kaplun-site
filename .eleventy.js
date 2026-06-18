module.exports = function (eleventyConfig) {
  // Копіюємо статичні файли як є
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "src/script.js": "script.js" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // Дата у форматі ДД.ММ.РРРР (українською)
  eleventyConfig.addFilter("dateUk", function (value) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" });
  });

  // ISO-дата для sitemap (YYYY-MM-DD)
  eleventyConfig.addFilter("dateISO", function (value) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return "";
    return d.toISOString().split("T")[0];
  });

  // Колекція статей (за тегом "post"), новіші — першими
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByTag("post").reverse();
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    },
    // .html файли копіюємо без шаблонізації (готова верстка index.html)
    htmlTemplateEngine: false,
    markdownTemplateEngine: "njk"
  };
};
