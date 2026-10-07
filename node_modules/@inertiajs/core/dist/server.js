// src/server.ts
import { createServer } from "http";
import cluster from "node:cluster";
import { existsSync, readFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import path from "node:path";
import * as process2 from "process";
import { originalPositionFor, TraceMap } from "@jridgewell/trace-mapping";

// src/ssrErrors.ts
var sourceMapResolver = null;
function setSourceMapResolver(resolver) {
  sourceMapResolver = resolver;
}
var BROWSER_APIS = {
  // Global objects
  window: "The global window object",
  document: "The DOM document object",
  navigator: "The navigator object",
  location: "The location object",
  history: "The browser history API",
  screen: "The screen object",
  localStorage: "Browser local storage",
  sessionStorage: "Browser session storage",
  // Viewport properties (accessed via window.X)
  innerWidth: "Browser viewport width",
  innerHeight: "Browser viewport height",
  outerWidth: "Browser window width",
  outerHeight: "Browser window height",
  scrollX: "Horizontal scroll position",
  scrollY: "Vertical scroll position",
  devicePixelRatio: "The device pixel ratio",
  matchMedia: "The matchMedia function",
  // Observers (commonly instantiated at module level)
  IntersectionObserver: "The IntersectionObserver API",
  ResizeObserver: "The ResizeObserver API",
  MutationObserver: "The MutationObserver API",
  // Timing functions (commonly called at module level)
  requestAnimationFrame: "The requestAnimationFrame function",
  requestIdleCallback: "The requestIdleCallback function",
  // Constructors that might be used at module level
  Image: "The Image constructor",
  Audio: "The Audio constructor",
  Worker: "The Worker constructor",
  BroadcastChannel: "The BroadcastChannel constructor",
  // Network (older Node.js versions)
  fetch: "The fetch API",
  XMLHttpRequest: "The XMLHttpRequest API"
};
function detectBrowserApi(error) {
  const message = error.message.toLowerCase();
  for (const api of Object.keys(BROWSER_APIS)) {
    const patterns = [
      `${api.toLowerCase()} is not defined`,
      `'${api.toLowerCase()}' is not defined`,
      `"${api.toLowerCase()}" is not defined`,
      `cannot read properties of undefined (reading '${api.toLowerCase()}')`,
      `cannot read property '${api.toLowerCase()}'`
    ];
    if (patterns.some((pattern) => message.includes(pattern))) {
      return api;
    }
  }
  return null;
}
function isComponentResolutionError(error) {
  const message = error.message.toLowerCase();
  return message.includes("cannot find module") || message.includes("failed to resolve") || message.includes("module not found") || message.includes("could not resolve");
}
var LIFECYCLE_HOOKS = "onMounted/useEffect/onMount";
function getBrowserApiHint(api) {
  const apiDescription = BROWSER_APIS[api] || `The "${api}" object`;
  if (["localStorage", "sessionStorage"].includes(api)) {
    return `${apiDescription} doesn't exist in Node.js. Check "typeof ${api} !== 'undefined'" before using it, or move the code to a ${LIFECYCLE_HOOKS} lifecycle hook.`;
  }
  if (["window", "document"].includes(api)) {
    return `${apiDescription} doesn't exist in Node.js. Wrap browser-specific code in a ${LIFECYCLE_HOOKS} lifecycle hook, or check "typeof ${api} !== 'undefined'" before using it.`;
  }
  if (["IntersectionObserver", "ResizeObserver", "MutationObserver"].includes(api)) {
    return `${apiDescription} doesn't exist in Node.js. Create observers inside a ${LIFECYCLE_HOOKS} lifecycle hook, not at the module level.`;
  }
  if (["fetch", "XMLHttpRequest"].includes(api)) {
    return `${apiDescription} may not be available in all Node.js versions. For SSR, ensure data fetching happens on the server (in your controller) and is passed as props, or use a ${LIFECYCLE_HOOKS} hook for client-side fetching.`;
  }
  return `${apiDescription} doesn't exist in Node.js. Move this code to a ${LIFECYCLE_HOOKS} lifecycle hook, or guard it with "typeof ${api} !== 'undefined'".`;
}
function getComponentResolutionHint(component) {
  const componentPart = component ? ` "${component}"` : "";
  return `Could not resolve component${componentPart}. Check that the file exists and the path is correct. Ensure the component name matches the file name exactly (case-sensitive).`;
}
function getRenderErrorHint() {
  return "An error occurred while rendering the component. Check the component for browser-specific code that runs during initialization. Move any code that accesses browser APIs to a lifecycle hook.";
}
function extractSourceLocation(stack) {
  if (!stack) {
    return void 0;
  }
  for (const line of stack.split("\n")) {
    if (!line.includes("at ")) {
      continue;
    }
    if (line.includes("node_modules") || line.includes("node:")) {
      continue;
    }
    let match = line.match(/\(([^)]+):(\d+):(\d+)\)/);
    if (!match) {
      match = line.match(/at\s+(?:file:\/\/)?(.+):(\d+):(\d+)\s*$/);
    }
    if (match) {
      const file = match[1].replace(/^file:\/\//, "");
      const lineNum = parseInt(match[2], 10);
      const colNum = parseInt(match[3], 10);
      if (sourceMapResolver) {
        const resolved = sourceMapResolver(file, lineNum, colNum);
        if (resolved) {
          return `${resolved.file}:${resolved.line}:${resolved.column}`;
        }
      }
      return `${file}:${lineNum}:${colNum}`;
    }
  }
  return void 0;
}
function classifySSRError(error, component, url) {
  const normalizedError = error instanceof Error ? error : new Error(typeof error === "string" ? error : String(error));
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const base = {
    error: normalizedError.message,
    component,
    url,
    stack: normalizedError.stack,
    sourceLocation: extractSourceLocation(normalizedError.stack),
    timestamp
  };
  const browserApi = detectBrowserApi(normalizedError);
  if (browserApi) {
    return {
      ...base,
      type: "browser-api",
      browserApi,
      hint: getBrowserApiHint(browserApi)
    };
  }
  if (isComponentResolutionError(normalizedError)) {
    return {
      ...base,
      type: "component-resolution",
      hint: getComponentResolutionHint(component)
    };
  }
  return {
    ...base,
    type: "render",
    hint: getRenderErrorHint()
  };
}
var colors = {
  reset: "\x1B[0m",
  red: "\x1B[31m",
  yellow: "\x1B[33m",
  cyan: "\x1B[36m",
  dim: "\x1B[2m",
  bold: "\x1B[1m",
  bgRed: "\x1B[41m",
  white: "\x1B[37m"
};
function makeRelative(path2, root) {
  const base = root ?? process.cwd();
  if (path2.startsWith(base + "/")) {
    return path2.slice(base.length + 1);
  }
  return path2;
}
function formatConsoleError(classified, root, formatErrors = true, suppressedWarnings = []) {
  if (!formatErrors) {
    const component = classified.component ? `[${classified.component}]` : "";
    return `SSR Error ${component}: ${classified.error}`;
  }
  const componentPart = classified.component ? `  ${colors.cyan}${classified.component}${colors.reset}` : "";
  const lines = [
    "",
    `  ${colors.bgRed}${colors.white}${colors.bold} SSR ERROR ${colors.reset}${componentPart}`,
    "",
    `  ${classified.error}`
  ];
  if (classified.sourceLocation) {
    const relativePath = makeRelative(classified.sourceLocation, root);
    lines.push(`  ${colors.dim}Source: ${relativePath}${colors.reset}`);
  }
  if (classified.url) {
    lines.push(`  ${colors.dim}URL: ${classified.url}${colors.reset}`);
  }
  lines.push("", `  ${colors.yellow}Hint${colors.reset}  ${classified.hint}`, "");
  if (classified.stack) {
    lines.push(`  ${colors.dim}${classified.stack.split("\n").join("\n  ")}${colors.reset}`, "");
  }
  if (suppressedWarnings.length > 0) {
    lines.push(`  ${colors.dim}Suppressed ${suppressedWarnings.length} framework warning(s).${colors.reset}`, "");
  }
  return lines.join("\n");
}

// src/server.ts
var sourceMaps = /* @__PURE__ */ new Map();
setSourceMapResolver((file, line, column) => {
  if (!file.includes("/ssr/") || !file.endsWith(".js")) {
    return null;
  }
  const mapFile = file + ".map";
  if (!existsSync(mapFile)) {
    return null;
  }
  let traceMap = sourceMaps.get(mapFile);
  if (!traceMap) {
    try {
      const mapContent = readFileSync(mapFile, "utf-8");
      traceMap = new TraceMap(mapContent);
      sourceMaps.set(mapFile, traceMap);
    } catch {
      return null;
    }
  }
  const original = originalPositionFor(traceMap, { line, column });
  if (original.source) {
    const mapDir = path.dirname(mapFile);
    const resolvedPath = path.resolve(mapDir, original.source);
    return {
      file: resolvedPath,
      line: original.line ?? line,
      column: original.column ?? column
    };
  }
  return null;
});
var readableToString = (readable) => new Promise((resolve, reject) => {
  let data = "";
  readable.on("data", (chunk) => data += chunk);
  readable.on("end", () => resolve(data));
  readable.on("error", (err) => reject(err));
});
var server_default = (render, options) => {
  const opts = typeof options === "number" ? { port: options } : options;
  const { port = 13714, host = "0.0.0.0", cluster: useCluster = false, formatErrors = true } = opts ?? {};
  const log = (message) => {
    console.log(
      useCluster && !cluster.isPrimary ? `[${cluster.worker?.id ?? "N/A"} / ${cluster.worker?.process?.pid ?? "N/A"}] ${message}` : message
    );
  };
  if (useCluster && cluster.isPrimary) {
    log("Primary Inertia SSR server process started...");
    for (let i = 0; i < availableParallelism(); i++) {
      cluster.fork();
    }
    cluster.on("message", (_worker, message) => {
      if (message === "shutdown") {
        for (const id in cluster.workers) {
          cluster.workers[id]?.kill();
        }
        process2.exit();
      }
    });
    return render;
  }
  const handleRender = async (request, response) => {
    const page = JSON.parse(await readableToString(request));
    const originalWarn = console.warn;
    if (formatErrors) {
      console.warn = () => {
      };
    }
    try {
      const result = await render(page);
      response.writeHead(200, { "Content-Type": "application/json", Server: "Inertia.js SSR" });
      response.write(JSON.stringify(result));
    } catch (e) {
      const error = e;
      if (!formatErrors) {
        throw error;
      }
      const classified = classifySSRError(error, page.component, page.url);
      console.error(formatConsoleError(classified));
      response.writeHead(500, { "Content-Type": "application/json", Server: "Inertia.js SSR" });
      response.write(JSON.stringify(classified));
    } finally {
      console.warn = originalWarn;
    }
  };
  const routes = {
    "/health": async () => ({ status: "OK", timestamp: Date.now() }),
    "/shutdown": async () => {
      if (cluster.isWorker) {
        process2.send?.("shutdown");
      }
      process2.exit();
    },
    "/render": handleRender,
    "/404": async () => ({ status: "NOT_FOUND", timestamp: Date.now() })
  };
  createServer(async (request, response) => {
    const dispatchRoute = routes[request.url] ?? routes["/404"];
    const result = await dispatchRoute(request, response);
    if (!response.headersSent) {
      response.writeHead(200, { "Content-Type": "application/json", Server: "Inertia.js SSR" });
      response.write(JSON.stringify(result));
    }
    response.end();
  }).listen({ port, host }, () => log("Inertia SSR server started."));
  log(`Starting SSR server on port ${port}...`);
  return render;
};
export {
  server_default as default
};
//# sourceMappingURL=server.js.map
