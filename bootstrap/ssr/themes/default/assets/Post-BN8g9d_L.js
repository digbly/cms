import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, useForm, Head, Link } from "@inertiajs/react";
import { A as AppLayout } from "./AppLayout-_et35-Ng.js";
import { r as route } from "../ssr.js";
import { P as Pagination } from "./Pagination-Eg4dKc_s.js";
import "@inertiajs/react/server";
import "react-dom/server";
function CommentForm({
  postId,
  parentId,
  compact = false,
  submitLabel = "Submit comment"
}) {
  const { auth } = usePage().props;
  const form = useForm({
    name: auth.user?.name ?? "",
    email: auth.user?.email ?? "",
    content: "",
    parent_id: parentId ?? ""
  });
  const submit = (event) => {
    event.preventDefault();
    form.post(route("default.comments.store", { post: postId }), {
      preserveScroll: true,
      onSuccess: () => form.reset("content", "parent_id")
    });
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: compact ? "grid gap-3" : "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-slate-600", children: "Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: form.data.name,
            onChange: (event) => form.setData("name", event.target.value),
            className: "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          }
        ),
        form.errors.name && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-rose-500", children: form.errors.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-slate-600", children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            value: form.data.email,
            onChange: (event) => form.setData("email", event.target.value),
            className: "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          }
        ),
        form.errors.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-rose-500", children: form.errors.email })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-slate-600", children: "Comment" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: form.data.content,
          onChange: (event) => form.setData("content", event.target.value),
          rows: compact ? 3 : 4,
          className: "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        }
      ),
      form.errors.content && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-rose-500", children: form.errors.content })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        disabled: form.processing,
        className: "inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60",
        children: submitLabel
      }
    )
  ] });
}
const formatDate$1 = (value) => {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
function CommentItem({ postId, comment }) {
  return /* @__PURE__ */ jsxs("li", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600", children: comment.author_name.charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-slate-800", children: comment.author_name }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: formatDate$1(comment.created_at) })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 whitespace-pre-line text-sm leading-6 text-slate-600", children: comment.content }),
        /* @__PURE__ */ jsxs("details", { className: "mt-2", children: [
          /* @__PURE__ */ jsx("summary", { className: "cursor-pointer text-xs font-semibold text-indigo-600", children: "Reply" }),
          /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(
            CommentForm,
            {
              postId,
              parentId: comment.id,
              compact: true,
              submitLabel: "Reply"
            }
          ) })
        ] })
      ] })
    ] }),
    comment.replies.length > 0 && /* @__PURE__ */ jsx("ul", { className: "ml-12 space-y-4 border-l border-slate-200 pl-4", children: comment.replies.map((reply) => /* @__PURE__ */ jsx(CommentItem, { postId, comment: reply }, reply.id)) })
  ] });
}
function CommentList({
  postId,
  comments
}) {
  if (comments.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "No comments yet." });
  }
  return /* @__PURE__ */ jsx("ul", { className: "space-y-6", children: comments.map((comment) => /* @__PURE__ */ jsx(CommentItem, { postId, comment }, comment.id)) });
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
function Post({
  siteName,
  messages,
  navCategories,
  sidebarWidgets,
  post,
  comments,
  commentStatus
}) {
  return /* @__PURE__ */ jsxs(AppLayout, { siteName, navCategories, sidebarWidgets, children: [
    /* @__PURE__ */ jsx(Head, { title: post.title ?? "" }),
    /* @__PURE__ */ jsxs("article", { children: [
      /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-12 text-white", children: [
        post.categories.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-4 flex flex-wrap gap-2", children: post.categories.map((category) => /* @__PURE__ */ jsx(
          Link,
          {
            href: category.url ?? "#",
            className: "rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-white/25",
            children: category.name
          },
          category.id
        )) }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black leading-tight tracking-tight sm:text-4xl", children: post.title }),
        post.description && /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-2xl text-base leading-7 text-indigo-100", children: post.description }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-3 text-xs text-indigo-100", children: [
          /* @__PURE__ */ jsx("span", { children: post.author_name ?? siteName }),
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsx("span", { children: formatDate(post.created_at) }),
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            post.views,
            " ",
            messages.views
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "article-content mt-8",
          dangerouslySetInnerHTML: { __html: post.content ?? "" }
        }
      ),
      /* @__PURE__ */ jsxs("section", { id: "comments", className: "mt-12 border-t border-slate-200 pt-8", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold text-slate-900", children: [
          messages.comments,
          " ",
          /* @__PURE__ */ jsxs("span", { className: "text-slate-400", children: [
            "(",
            comments.total,
            ")"
          ] })
        ] }),
        commentStatus && /* @__PURE__ */ jsx("p", { className: "mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800", children: commentStatus }),
        /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(CommentList, { postId: post.id, comments: comments.data }) }),
        /* @__PURE__ */ jsx(Pagination, { paginator: comments }),
        /* @__PURE__ */ jsxs("div", { className: "mt-10 rounded-2xl border border-slate-200 bg-white p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "mb-4 text-sm font-bold uppercase tracking-wider text-slate-900", children: messages.leave_comment }),
          /* @__PURE__ */ jsx(
            CommentForm,
            {
              postId: post.id,
              submitLabel: messages.submit_comment ?? "Submit comment"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  Post as default
};
