import { jsx } from "react/jsx-runtime";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import ReactDOMServer from "react-dom/server";
const pages = /* @__PURE__ */ Object.assign({ "../pages/Category.tsx": () => import("./assets/Category-oWxLOXht.js"), "../pages/Home.tsx": () => import("./assets/Home-DEcDoq4x.js"), "../pages/NotFound.tsx": () => import("./assets/NotFound-BpCUMJ-m.js"), "../pages/Post.tsx": () => import("./assets/Post-BN8g9d_L.js"), "../pages/Search.tsx": () => import("./assets/Search-D349S3D5.js") });
function resolvePage(name) {
  const normalized = name.replace(/\./g, "/");
  const tsx = `../pages/${normalized}.tsx`;
  const jsx2 = `../pages/${normalized}.jsx`;
  if (pages[tsx]) {
    return pages[tsx]();
  }
  if (pages[jsx2]) {
    return pages[jsx2]();
  }
  throw new Error(`Inertia page not found for "${name}" (pages/${normalized}.tsx)`);
}
let routes = {};
function setRoutes(next = {}) {
  routes = next;
  if (typeof window !== "undefined") {
    window.__routes = next;
  }
}
function route(name, params = {}) {
  const map = (typeof window !== "undefined" ? window.__routes : void 0) ?? routes;
  let url = map[name];
  if (!url) {
    return name;
  }
  const query = {};
  Object.entries(params).forEach(([key, value]) => {
    if (url.includes(`{${key}}`)) {
      url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
    } else {
      query[key] = value;
    }
  });
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== void 0 && value !== null && value !== "") {
      search.append(key, String(value));
    }
  });
  const queryString = search.toString();
  if (queryString) {
    url += (url.includes("?") ? "&" : "?") + queryString;
  }
  return url;
}
if (typeof window !== "undefined") {
  window.route = route;
}
const port = Number(process.env.SSR_PORT ?? 13714);
const host = process.env.SSR_HOST ?? "127.0.0.1";
createServer(
  (page) => createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: resolvePage,
    setup({ App, props }) {
      setRoutes(
        props.initialPage.props.routes ?? {}
      );
      return /* @__PURE__ */ jsx(App, { ...props });
    }
  }),
  { port, host }
);
export {
  route as r
};
