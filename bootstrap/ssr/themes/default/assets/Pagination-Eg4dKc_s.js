import { jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
function Pagination({ paginator }) {
  if (paginator.last_page <= 1) {
    return null;
  }
  return /* @__PURE__ */ jsx("nav", { "aria-label": "Pagination", className: "mt-10 flex flex-wrap items-center gap-1.5", children: paginator.links.map(
    (link, index) => link.url ? /* @__PURE__ */ jsx(
      Link,
      {
        href: link.url,
        preserveScroll: true,
        dangerouslySetInnerHTML: { __html: link.label },
        className: `inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${link.active ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"}`
      },
      index
    ) : /* @__PURE__ */ jsx(
      "span",
      {
        dangerouslySetInnerHTML: { __html: link.label },
        className: "inline-flex min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400"
      },
      index
    )
  ) });
}
export {
  Pagination as P
};
