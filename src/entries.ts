import { createPages } from "waku";
import Index from "./components/Index";
import RootLayout from "./components/RootLayout";

export default createPages(async ({ createPage, createLayout }) => [
  createLayout({ render: "static", path: "/", component: RootLayout }),
  createPage({ render: "static", path: "/", component: Index }),
]);
