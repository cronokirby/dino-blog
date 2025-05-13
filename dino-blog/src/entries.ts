import { createPages, getEnv } from "waku";
import Index from "./components/Index";
import * as path from "path";
import * as fs from "fs/promises";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { Root } from "mdast";

async function readMarkdownFile(): Promise<Root> {
  const blogRoot = getEnv("BLOG_ROOT");
  if (!blogRoot) {
    throw new Error("BLOG_ROOT must be defined");
  }
  const mainMarkdownFile = path.join(blogRoot, "seals.md");
  const markdown = await fs.readFile(mainMarkdownFile, "utf-8");
  return unified().use(remarkParse).parse(markdown);
}

export default createPages(async ({ createPage, createLayout }) => {
  const ast = await readMarkdownFile();
  return [createPage({ render: "static", path: "/", component: Index(ast) })];
});
