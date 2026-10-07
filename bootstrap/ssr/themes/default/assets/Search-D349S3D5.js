import { jsxs, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { A as AppLayout } from "./AppLayout-_et35-Ng.js";
import { P as Pagination } from "./Pagination-Eg4dKc_s.js";
import { P as PostCard } from "./PostCard-BJtU7kGV.js";
import { r as route } from "../ssr.js";
import "@inertiajs/react/server";
import "react-dom/server";
function Search({
  siteName,
  messages,
  navCategories,
  sidebarWidgets,
  search,
  posts
}) {
  return /* @__PURE__ */ jsxs(AppLayout, { siteName, navCategories, sidebarWidgets, children: [
    /* @__PURE__ */ jsx(Head, { title: "Search" }),
    /* @__PURE__ */ jsxs("header", { className: "mb-8 space-y-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-900", children: messages.search_results?.replace(":query", search) ?? `Search: ${search}` }),
      /* @__PURE__ */ jsxs("form", { action: route("default.search"), method: "get", className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "search",
            name: "q",
            defaultValue: search,
            placeholder: messages.search_placeholder ?? "Search",
            className: "w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500",
            children: messages.search ?? "Search"
          }
        )
      ] })
    ] }),
    posts.data.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: messages.no_search_results }) : /* @__PURE__ */ jsx("div", { className: "grid gap-6 sm:grid-cols-2", children: posts.data.map((post) => /* @__PURE__ */ jsx(PostCard, { post }, post.id)) }),
    /* @__PURE__ */ jsx(Pagination, { paginator: posts })
  ] });
}
export {
  Search as default
};
