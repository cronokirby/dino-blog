import { Root, RootContent } from "mdast";
import { ReactElement, ReactNode } from "react";

function RenderContent({ content }: { content: RootContent }): ReactNode {
  if (content.type === "heading") {
    if (content.depth === 1) {
      return (
        <h1 className="mt-4 text-3xl">
          <RenderContents contents={content.children} />
        </h1>
      );
    }
    if (content.depth === 2) {
      return (
        <h2 className="mt-4 text-2xl">
          <RenderContents contents={content.children} />
        </h2>
      );
    }
    if (content.depth >= 3) {
      return (
        <h3 className="mt-4 text-xl">
          <RenderContents contents={content.children} />
        </h3>
      );
    }
  }
  if (content.type === "text") {
    return <>{content.value}</>;
  }
  if (content.type === "paragraph") {
    return (
      <p className="mt-2">
        <RenderContents contents={content.children} />
      </p>
    );
  }
  if (content.type === "list") {
    if (content.ordered) {
      return (
        <ol className="list-decimal">
          <RenderContents contents={content.children} />
        </ol>
      );
    } else {
      return (
        <ul className="list-disc">
          <RenderContents contents={content.children} />
        </ul>
      );
    }
  }
  if (content.type === "listItem") {
    return (
      <li>
        <RenderContents contents={content.children} />
      </li>
    );
  }
  if (content.type === "strong") {
    return (
      <span className="font-bold">
        <RenderContents contents={content.children} />
      </span>
    );
  }
  throw new Error(`unknown element type: ${content.type}`);
}

function RenderContents({ contents }: { contents: RootContent[] }): ReactNode {
  return (
    <>
      {contents.map((x, i) => (
        <RenderContent content={x} key={i} />
      ))}
    </>
  );
}

export default (ast: Root) => () => {
  return (
    <html lang="en">
      <head>
        <title>Dino Blog!!!</title>
      </head>
      <body className="font-serif">
        <article className="w-[70ch] mx-auto wrap-break-word text-left leading-6">
          <RenderContents contents={ast.children} />
        </article>
      </body>
    </html>
  );
};
