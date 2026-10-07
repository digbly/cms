import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { A as AppLayout } from "./AppLayout-_et35-Ng.js";
import { P as PostCard } from "./PostCard-BJtU7kGV.js";
import { P as Pagination } from "./Pagination-Eg4dKc_s.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "react-dom/server";
function Hero({ block }) {
  const title = block.data.title ?? block.label;
  const description = block.data.description ?? "";
  return /* @__PURE__ */ jsxs("section", { className: "overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-14 text-white", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black tracking-tight sm:text-4xl", children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-2xl text-base leading-7 text-indigo-100", children: description })
  ] });
}
function Posts({ block }) {
  const posts = block.data.posts ?? [];
  const title = block.data.title;
  return /* @__PURE__ */ jsxs("section", { className: "space-y-6", children: [
    title && /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold tracking-tight text-slate-900", children: title }),
    posts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "No posts yet." }) : /* @__PURE__ */ jsx("div", { className: "grid gap-6 sm:grid-cols-2", children: posts.map((post) => /* @__PURE__ */ jsx(PostCard, { post }, post.id)) })
  ] });
}
const registry = {
  "Blocks/Hero": Hero,
  "Blocks/Posts": Posts
};
function BlockRenderer({ block }) {
  const Component = block.component ? registry[block.component] : void 0;
  if (!Component) {
    return null;
  }
  return /* @__PURE__ */ jsx(Component, { block });
}
function Home({
  siteName,
  messages,
  navCategories,
  sidebarWidgets,
  heading,
  subheading,
  posts,
  template,
  blocks
}) {
  const hasBlocks = template !== null && Object.keys(blocks).length > 0;
  return /* @__PURE__ */ jsxs(AppLayout, { siteName, navCategories, sidebarWidgets, children: [
    /* @__PURE__ */ jsx(Head, { title: heading }),
    hasBlocks ? /* @__PURE__ */ jsx("div", { className: "space-y-10", children: Object.entries(template.blocks).map(([container]) => /* @__PURE__ */ jsx("div", { className: "space-y-6", children: (blocks[container] ?? []).map((block) => /* @__PURE__ */ jsx(BlockRenderer, { block }, block.id)) }, container)) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("header", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-900", children: heading }),
        subheading && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: subheading })
      ] }),
      !posts || posts.data.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: messages.no_posts }) : /* @__PURE__ */ jsx("div", { className: "grid gap-6 sm:grid-cols-2", children: posts.data.map((post) => /* @__PURE__ */ jsx(PostCard, { post }, post.id)) }),
      posts && /* @__PURE__ */ jsx(Pagination, { paginator: posts })
    ] })
  ] });
}
export {
  Home as default
};
