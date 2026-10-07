import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
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
function PostCard({ post }) {
  return /* @__PURE__ */ jsx("article", { className: "group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col p-5", children: [
    post.categories.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-3 flex flex-wrap gap-1.5", children: post.categories.map((category) => /* @__PURE__ */ jsx(
      Link,
      {
        href: category.url ?? "#",
        className: "rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100",
        children: category.name
      },
      category.id
    )) }),
    /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold leading-snug tracking-tight text-slate-900", children: /* @__PURE__ */ jsx(Link, { href: post.url ?? "#", className: "hover:text-indigo-600", children: post.title }) }),
    post.description && /* @__PURE__ */ jsx("p", { className: "mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-500", children: post.description }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between text-xs text-slate-400", children: [
      /* @__PURE__ */ jsx("span", { children: post.author_name ?? "" }),
      /* @__PURE__ */ jsx("span", { children: formatDate(post.created_at) })
    ] })
  ] }) });
}
export {
  PostCard as P
};
