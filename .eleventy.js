const Image = require("@11ty/eleventy-img");
const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");
const markdownItFootnote = require("markdown-it-footnote");
const pluginRss = require("@11ty/eleventy-plugin-rss");

async function portraitShortcode() {
  let metadata = await Image("./assets/portrait.png", {
    widths: [128],
    formats: ["webp"],
    outputDir: "./_site/img/",
  });
  let src = metadata.webp[0];
  return `<img src="${src.url}" alt="Portrait photo of Fabian Böller">`;
}

async function sizedImageShortcode(src, alt, width) {
  let metadata = await Image(src, {
    widths: [width],
    formats: ["webp"],
    outputDir: "./_site/img/",
  });
  let picsrc = metadata.webp[0];
  return `<img
      src="${picsrc.url}"
      alt="${alt}"
      loading="lazy"
      decoding="async">`;
}

async function imageShortcode(src) {
  let metadata = await Image(src, {
    widths: [325, 1280],
    formats: ["webp"],
    outputDir: "./_site/img/",
  });

  let lowsrc = metadata.webp[0];
  let highsrc = metadata.webp[metadata.webp.length - 1];
  return `<a href="${highsrc.url}">
    <img
      src="${lowsrc.url}"
      width="${lowsrc.width}"
      height="${lowsrc.height}"
      loading="lazy"
      decoding="async">
    </a>`;
}

async function postLinkShortcode(link, title) {
  return `<a href="${link}" target="_blank">For more information on this, checkout '${title}'</a>`;
}

function configureMarkdown(eleventyConfig) {
  const markdownItOptions = {
    html: true,
  };
  const permalinkOpts = {
    symbol: "🔗",
  };
  const markdownLib = markdownIt(markdownItOptions)
    .use(markdownItAttrs)
    .use(markdownItFootnote);
  eleventyConfig.setLibrary("md", markdownLib);
}

function addShortcode(eleventyConfig, tagName, f) {
  eleventyConfig.addNunjucksAsyncShortcode(tagName, f);
  eleventyConfig.addLiquidShortcode(tagName, f);
  eleventyConfig.addJavaScriptFunction(tagName, f);
}

module.exports = function (eleventyConfig) {
  addShortcode(eleventyConfig, "portrait", portraitShortcode);
  addShortcode(eleventyConfig, "sizedImage", sizedImageShortcode);
  addShortcode(eleventyConfig, "image", imageShortcode);
  addShortcode(eleventyConfig, "postLink", postLinkShortcode);
  eleventyConfig.addPassthroughCopy("node_modules/blueimp-gallery");
  eleventyConfig.addPassthroughCopy("node_modules/flag-icon-css");
  eleventyConfig.addPassthroughCopy("node_modules/@fortawesome");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("code/**/*.png");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.setWatchJavaScriptDependencies(false);
  eleventyConfig.addNunjucksFilter("imageFiles", (directory) => {
    if (!directory) {
      return [];
    }
    const fileNames = fs.readdirSync(directory);
    return fileNames
      .filter((fileName) => fileName.endsWith(".jpg"))
      .map((fileName) => `${directory}/${fileName}`);
  });
  eleventyConfig.addNunjucksFilter("imageDirs", (directory) => {
    if (!directory) {
      return [];
    }
    const fileNames = fs.readdirSync(directory);
    return fileNames
      .map((fileName) => `${directory}/${fileName}`)
      .filter((fileName) => fs.statSync(fileName).isDirectory());
  });
  eleventyConfig.addNunjucksFilter("fileName", (directory) => {
    if (!directory) {
      return "location";
    }
    return path.basename(directory);
  });
  eleventyConfig.addNunjucksFilter("locationTitle", (baseName) => {
    return baseName
      .split("-")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  });
  eleventyConfig.addFilter("formatdate", (date) => {
    const timeDiff = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.valueOf() + timeDiff);
    return adjustedDate.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  });
  configureMarkdown(eleventyConfig);
};
