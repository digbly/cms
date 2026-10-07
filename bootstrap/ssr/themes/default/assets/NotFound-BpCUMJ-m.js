import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { A as AppLayout } from "./AppLayout-_et35-Ng.js";
import { r as route } from "../ssr.js";
import "@inertiajs/react/server";
import "react-dom/server";
function NotFound({
  siteName,
  messages,
  navCategories,
  sidebarWidgets
}) {
  return /* @__PURE__ */ jsxs(AppLayout, { siteName, navCategories, sidebarWidgets, children: [
    /* @__PURE__ */ jsx(Head, { title: messages.not_found ?? "Not found" }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white px-8 py-16 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-6xl font-black tracking-tight text-indigo-600", children: "404" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-4 text-2xl font-bold text-slate-900", children: messages.not_found ?? "Page not found" }),
      /* @__PURE__ */ jsx("p", { className: "mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500", children: messages.not_found_description }),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("default.home"),
          className: "mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500",
          children: messages.back_home ?? "Back to home"
        }
      )
    ] })
  ] });
}
export {
  NotFound as default
};
