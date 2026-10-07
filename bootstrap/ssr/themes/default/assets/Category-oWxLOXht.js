import { jsxs, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { A as AppLayout } from "./AppLayout-_et35-Ng.js";
import { P as Pagination } from "./Pagination-Eg4dKc_s.js";
import { P as PostCard } from "./PostCard-BJtU7kGV.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "react-dom/server";
function Category({
  siteName,
  messages,
  navCategories,
  sidebarWidgets,
  heading,
  subheading,
  posts
}) {
  return /* @__PURE__ */ jsxs(AppLayout, { siteName, navCategories, sidebarWidgets, children: [
    /* @__PURE__ */ jsx(Head, { title: heading }),
    /* @__PURE__ */ jsxs("header", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-widest text-indigo-500", children: "Categories" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-1 text-2xl font-bold tracking-tight text-slate-900", children: heading }),
      subheading && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: subheading })
    ] }),
    posts.data.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: messages.no_posts }) : /* @__PURE__ */ jsx("div", { className: "grid gap-6 sm:grid-cols-2", children: posts.data.map((post) => /* @__PURE__ */ jsx(PostCard, { post }, post.id)) }),
    /* @__PURE__ */ jsx(Pagination, { paginator: posts })
  ] });
}
export {
  Category as default
};
