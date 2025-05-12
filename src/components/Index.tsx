import { Root, RootContent } from "mdast";
import { ReactNode } from "react";

interface Context {
  insideList?: boolean;
}

function RenderContent({
  content,
  ctx,
}: {
  content: RootContent;
  ctx?: Context;
}): ReactNode {
  if (content.type === "heading") {
    if (content.depth === 1) {
      return (
        <h1 className="my-4 text-3xl">
          <RenderContents contents={content.children} />
        </h1>
      );
    }
    if (content.depth === 2) {
      return (
        <h2 className="my-2 text-2xl">
          <RenderContents contents={content.children} />
        </h2>
      );
    }
    if (content.depth >= 3) {
      return (
        <h3 className="my-2 text-xl">
          <RenderContents contents={content.children} />
        </h3>
      );
    }
  }
  if (content.type === "text") {
    return <>{content.value}</>;
  }
  if (content.type === "paragraph") {
    if (ctx?.insideList) {
      return (
        <>
          <RenderContents contents={content.children} />
        </>
      );
    }
    return (
      <p className="my-1">
        <RenderContents contents={content.children} />
      </p>
    );
  }
  if (content.type === "list") {
    if (content.ordered) {
      return (
        <ol className="list-decimal list-inside">
          <RenderContents
            contents={content.children}
            ctx={{ insideList: true }}
          />
        </ol>
      );
    } else {
      return (
        <ul className="list-disc list-inside">
          <RenderContents
            contents={content.children}
            ctx={{ insideList: true }}
          />
        </ul>
      );
    }
  }
  if (content.type === "listItem") {
    return (
      <li>
        <RenderContents
          contents={content.children}
          ctx={{ insideList: true }}
        />
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

function RenderContents({
  contents,
  ctx,
}: {
  contents: RootContent[];
  ctx?: Context;
}): ReactNode {
  return (
    <>
      {contents.map((x, i) => (
        <RenderContent content={x} ctx={ctx} key={i} />
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
      <body className="font-serif bg-paper text-flexoki-black">
        <article className="w-[70ch] mx-auto wrap-break-word text-left leading-5">
          <RenderContents contents={ast.children} />
        </article>
      </body>
    </html>
  );
};
