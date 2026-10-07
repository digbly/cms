import { jsxs, jsx } from "react/jsx-runtime";
import { Link, usePage } from "@inertiajs/react";
import { r as route } from "../ssr.js";
function Categories({ widget }) {
  const categories = widget.data.categories ?? [];
  return /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-5", children: [
    /* @__PURE__ */ jsx("h3", { className: "mb-4 text-sm font-bold uppercase tracking-wider text-slate-900", children: widget.label }),
    categories.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "No categories yet." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: categories.map((category) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
      Link,
      {
        href: category.url ?? "#",
        className: "flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600",
        children: [
          /* @__PURE__ */ jsx("span", { children: category.name }),
          typeof category.posts_count === "number" && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500", children: category.posts_count })
        ]
      }
    ) }, category.id)) })
  ] });
}
const formatDate = (value) => {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};
function RecentPosts({ widget }) {
  const posts = widget.data.posts ?? [];
  return /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-5", children: [
    /* @__PURE__ */ jsx("h3", { className: "mb-4 text-sm font-bold uppercase tracking-wider text-slate-900", children: widget.label }),
    posts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "No posts yet." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: posts.map((post) => /* @__PURE__ */ jsxs("li", { children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: post.url ?? "#",
          className: "block text-sm font-medium text-slate-700 transition-colors hover:text-indigo-600",
          children: post.title
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: formatDate(post.created_at) })
    ] }, post.id)) })
  ] });
}
function PopularPosts({ widget }) {
  const posts = widget.data.posts ?? [];
  return /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-5", children: [
    /* @__PURE__ */ jsx("h3", { className: "mb-4 text-sm font-bold uppercase tracking-wider text-slate-900", children: widget.label }),
    posts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "No posts yet." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: posts.map((post) => /* @__PURE__ */ jsxs("li", { children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: post.url ?? "#",
          className: "block text-sm font-medium text-slate-700 transition-colors hover:text-indigo-600",
          children: post.title
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-400", children: [
        post.views,
        " views"
      ] })
    ] }, post.id)) })
  ] });
}
const registry = {
  "Widgets/Categories": Categories,
  "Widgets/RecentPosts": RecentPosts,
  "Widgets/PopularPosts": PopularPosts
};
function WidgetRenderer({ widget }) {
  const Component = widget.component ? registry[widget.component] : void 0;
  if (!Component) {
    return null;
  }
  return /* @__PURE__ */ jsx(Component, { widget });
}
function Sidebar({ widgets }) {
  if (widgets.length === 0) {
    return /* @__PURE__ */ jsx("aside", { className: "hidden lg:block" });
  }
  return /* @__PURE__ */ jsx("aside", { className: "space-y-6", children: widgets.map((widget, index) => /* @__PURE__ */ jsx(WidgetRenderer, { widget }, `${widget.key}-${index}`)) });
}
const decode = (value) => value.replace(/&laquo;/g, "«").replace(/&raquo;/g, "»").replace(/&amp;/g, "&");
function AppLayout({
  title,
  siteName,
  navCategories,
  sidebarWidgets,
  children
}) {
  const { flash } = usePage().props;
  const notice = flash?.success ?? flash?.error ?? flash?.warning;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 text-slate-800", children: [
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3.5", children: [
      /* @__PURE__ */ jsxs(Link, { href: route("default.home"), className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white", children: (siteName ?? "L").charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsx("span", { className: "text-base font-bold tracking-tight text-slate-900", children: siteName })
      ] }),
      /* @__PURE__ */ jsxs("nav", { className: "hidden items-center gap-1 md:flex", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("default.home"),
            className: "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
            children: "All posts"
          }
        ),
        navCategories.map((category) => /* @__PURE__ */ jsx(
          Link,
          {
            href: category.url ?? "#",
            className: "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
            children: decode(category.name ?? "")
          },
          category.id
        ))
      ] }),
      /* @__PURE__ */ jsx("form", { action: route("default.search"), method: "get", className: "hidden sm:block", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "search",
            name: "q",
            placeholder: "Search articles",
            className: "w-44 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 lg:w-60"
          }
        ),
        /* @__PURE__ */ jsxs(
          "svg",
          {
            className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            children: [
              /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "7" }),
              /* @__PURE__ */ jsx("path", { d: "m20 20-3.5-3.5" })
            ]
          }
        )
      ] }) })
    ] }) }),
    notice && /* @__PURE__ */ jsx("div", { className: "border-b border-emerald-200 bg-emerald-50", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl px-4 py-2.5 text-sm text-emerald-800", children: notice }) }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]", children: [
      /* @__PURE__ */ jsxs("main", { className: "min-w-0", children: [
        title && /* @__PURE__ */ jsx("h1", { className: "mb-6 text-2xl font-bold tracking-tight text-slate-900", children: title }),
        children
      ] }),
      /* @__PURE__ */ jsx(Sidebar, { widgets: sidebarWidgets })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-slate-200 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-slate-500", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ",
        siteName
      ] }),
      /* @__PURE__ */ jsx(Link, { href: route("default.home"), className: "hover:text-slate-700", children: "Back to home" })
    ] }) })
  ] });
}
export {
  AppLayout as A
};
