// src/router.ts
import { cloneDeep as cloneDeep4, isEqual as isEqual3 } from "es-toolkit";
import { get as get7, set as set5 } from "es-toolkit/compat";

// src/config.ts
import { get, has, set } from "es-toolkit/compat";
var Config = class {
  config = {};
  defaults;
  constructor(defaults) {
    this.defaults = defaults;
  }
  extend(defaults) {
    if (defaults) {
      this.defaults = { ...this.defaults, ...defaults };
    }
    return this;
  }
  replace(newConfig) {
    this.config = newConfig;
  }
  get(key) {
    return has(this.config, key) ? get(this.config, key) : get(this.defaults, key);
  }
  set(keyOrValues, value) {
    if (typeof keyOrValues === "string") {
      set(this.config, keyOrValues, value);
    } else {
      Object.entries(keyOrValues).forEach(([key, val]) => {
        set(this.config, key, val);
      });
    }
  }
};
var config = new Config({
  form: {
    recentlySuccessfulDuration: 2e3,
    forceIndicesArrayFormatInFormData: true,
    withAllErrors: false
  },
  prefetch: {
    cacheFor: 3e4,
    hoverDelay: 75
  }
});

// src/eventHandler.ts
import { get as get4 } from "es-toolkit/compat";

// src/debounce.ts
function debounce(fn, delay) {
  let timeoutID;
  return function(...args) {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => fn.apply(this, args), delay);
  };
}

// src/events.ts
function fireEvent(name, options) {
  return document.dispatchEvent(new CustomEvent(`inertia:${name}`, options));
}
var fireBeforeEvent = (visit) => {
  return fireEvent("before", { cancelable: true, detail: { visit } });
};
var fireErrorEvent = (errors, { page: page2, visitId } = {}) => {
  return fireEvent("error", { detail: { errors, page: page2, visitId } });
};
var fireNetworkErrorEvent = (error) => {
  return fireEvent("networkError", { cancelable: true, detail: { error } });
};
var fireFinishEvent = (visit) => {
  return fireEvent("finish", { detail: { visit } });
};
var fireHttpExceptionEvent = (response) => {
  return fireEvent("httpException", { cancelable: true, detail: { response } });
};
var fireBeforeUpdateEvent = (page2) => {
  return fireEvent("beforeUpdate", { detail: { page: page2 } });
};
var fireNavigateEvent = (page2, { cached = false, visitId } = {}) => {
  return fireEvent("navigate", { detail: { page: page2, cached, visitId } });
};
var fireClientVisitEvent = (page2, { replace, visitId }) => {
  return fireEvent("clientVisit", { detail: { page: page2, replace, visitId } });
};
var fireProgressEvent = (progress3) => {
  return fireEvent("progress", { detail: { progress: progress3 } });
};
var fireStartEvent = (visit) => {
  return fireEvent("start", { detail: { visit } });
};
var fireSuccessEvent = (page2, { visitId } = {}) => {
  return fireEvent("success", { detail: { page: page2, visitId } });
};
var firePrefetchedEvent = (response, visit) => {
  return fireEvent("prefetched", { detail: { fetchedAt: Date.now(), response, visit } });
};
var firePrefetchingEvent = (visit) => {
  return fireEvent("prefetching", { detail: { visit } });
};
var fireFlashEvent = (flash) => {
  return fireEvent("flash", { detail: { flash } });
};
var fireLocationEvent = (url, versionChange) => {
  return fireEvent("location", { cancelable: true, detail: { url, versionChange } });
};

// src/history.ts
import { cloneDeep as cloneDeep3, isEqual } from "es-toolkit";

// src/sessionStorage.ts
var SessionStorage = class {
  static locationVisitKey = "inertiaLocationVisit";
  static set(key, value) {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    }
  }
  static get(key) {
    if (typeof window !== "undefined") {
      return JSON.parse(window.sessionStorage.getItem(key) || "null");
    }
  }
  static merge(key, value) {
    const existing = this.get(key);
    if (existing === null) {
      this.set(key, value);
    } else {
      this.set(key, { ...existing, ...value });
    }
  }
  static remove(key) {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(key);
    }
  }
  static removeNested(key, nestedKey) {
    const existing = this.get(key);
    if (existing !== null) {
      delete existing[nestedKey];
      this.set(key, existing);
    }
  }
  static exists(key) {
    try {
      return this.get(key) !== null;
    } catch (error) {
      return false;
    }
  }
  static clear() {
    if (typeof window !== "undefined") {
      window.sessionStorage.clear();
    }
  }
};

// src/encryption.ts
var encryptHistory = async (data) => {
  if (typeof window === "undefined") {
    throw new Error("Unable to encrypt history");
  }
  const iv = getIv();
  const storedKey = await getKeyFromSessionStorage();
  const key = await getOrCreateKey(storedKey);
  if (!key) {
    throw new Error("Unable to encrypt history");
  }
  const encrypted = await encryptData(iv, key, data);
  return encrypted;
};
var historySessionStorageKeys = {
  key: "historyKey",
  iv: "historyIv"
};
var decryptHistory = async (data) => {
  const iv = getIv();
  const storedKey = await getKeyFromSessionStorage();
  if (!storedKey) {
    throw new Error("Unable to decrypt history");
  }
  return await decryptData(iv, storedKey, data);
};
var encryptData = async (iv, key, data) => {
  if (typeof window === "undefined") {
    throw new Error("Unable to encrypt history");
  }
  if (typeof window.crypto.subtle === "undefined") {
    console.warn("Encryption is not supported in this environment. SSL is required.");
    return Promise.resolve(data);
  }
  const textEncoder = new TextEncoder();
  const str = JSON.stringify(data);
  const encoded = new Uint8Array(str.length * 3);
  const result = textEncoder.encodeInto(str, encoded);
  return window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    encoded.subarray(0, result.written)
  );
};
var decryptData = async (iv, key, data) => {
  if (typeof window.crypto.subtle === "undefined") {
    console.warn("Decryption is not supported in this environment. SSL is required.");
    return Promise.resolve(data);
  }
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    data
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
};
var getIv = () => {
  const ivString = SessionStorage.get(historySessionStorageKeys.iv);
  if (ivString) {
    return new Uint8Array(ivString);
  }
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  SessionStorage.set(historySessionStorageKeys.iv, Array.from(iv));
  return iv;
};
var createKey = async () => {
  if (typeof window.crypto.subtle === "undefined") {
    console.warn("Encryption is not supported in this environment. SSL is required.");
    return Promise.resolve(null);
  }
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
};
var saveKey = async (key) => {
  if (typeof window.crypto.subtle === "undefined") {
    console.warn("Encryption is not supported in this environment. SSL is required.");
    return Promise.resolve();
  }
  const keyData = await window.crypto.subtle.exportKey("raw", key);
  SessionStorage.set(historySessionStorageKeys.key, Array.from(new Uint8Array(keyData)));
};
var getOrCreateKey = async (key) => {
  if (key) {
    return key;
  }
  const newKey = await createKey();
  if (!newKey) {
    return null;
  }
  await saveKey(newKey);
  return newKey;
};
var getKeyFromSessionStorage = async () => {
  const stringKey = SessionStorage.get(historySessionStorageKeys.key);
  if (!stringKey) {
    return null;
  }
  const key = await window.crypto.subtle.importKey(
    "raw",
    new Uint8Array(stringKey),
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
};

// src/page.ts
import { cloneDeep as cloneDeep2 } from "es-toolkit";
import { get as get3, set as set3 } from "es-toolkit/compat";

// src/prefetched.ts
import { cloneDeep } from "es-toolkit";
import { get as get2 } from "es-toolkit/compat";

// src/objectUtils.ts
import { toPath } from "es-toolkit/compat";
var stripTopLevelUndefined = (obj) => {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== void 0) {
      result[key] = obj[key];
    }
  }
  return result;
};
var objectsAreEqual = (obj1, obj2, excludeKeys) => {
  if (obj1 === obj2) {
    return true;
  }
  for (const key in obj1) {
    if (excludeKeys.includes(key)) {
      continue;
    }
    if (obj1[key] === obj2[key]) {
      continue;
    }
    if (!compareValues(obj1[key], obj2[key])) {
      return false;
    }
  }
  for (const key in obj2) {
    if (excludeKeys.includes(key)) {
      continue;
    }
    if (!(key in obj1)) {
      return false;
    }
  }
  return true;
};
var compareValues = (value1, value2) => {
  switch (typeof value1) {
    case "object":
      return objectsAreEqual(value1, value2, []);
    case "function":
      return value1.toString() === value2.toString();
    default:
      return value1 === value2;
  }
};
var setPathPreservingIdentity = (target, path, value) => {
  const keys = toPath(path);
  if (keys.length === 0) {
    return target;
  }
  const copyAlongPath = (node, depth) => {
    if (depth === keys.length) {
      return value;
    }
    const key = keys[depth];
    const copy = Array.isArray(node) ? [...node] : node && typeof node === "object" ? { ...node } : /^(?:0|[1-9]\d*)$/.test(key) ? [] : {};
    copy[key] = copyAlongPath(node?.[key], depth + 1);
    return copy;
  };
  return copyAlongPath(target, 0);
};

// src/time.ts
var conversionMap = {
  ms: 1,
  s: 1e3,
  m: 1e3 * 60,
  h: 1e3 * 60 * 60,
  d: 1e3 * 60 * 60 * 24
};
var timeToMs = (time) => {
  if (typeof time === "number") {
    return time;
  }
  for (const [unit, conversion] of Object.entries(conversionMap)) {
    if (time.endsWith(unit)) {
      return parseFloat(time) * conversion;
    }
  }
  return parseInt(time);
};

// src/prefetched.ts
var PrefetchedRequests = class {
  cached = [];
  inFlightRequests = [];
  removalTimers = [];
  currentUseId = null;
  add(params, sendFunc, { cacheFor, cacheTags }) {
    const inFlight = this.findInFlight(params);
    if (inFlight) {
      return Promise.resolve();
    }
    const existing = this.findCached(params);
    if (!params.fresh && existing && existing.staleTimestamp > Date.now()) {
      return Promise.resolve();
    }
    const [stale, prefetchExpiresIn] = this.extractStaleValues(cacheFor);
    const promise = new Promise((resolve, reject) => {
      sendFunc({
        ...params,
        onCancel: () => {
          this.remove(params);
          params.onCancel();
          reject();
        },
        onError: (error) => {
          this.remove(params);
          params.onError(error);
          reject();
        },
        onPrefetching(visitParams) {
          params.onPrefetching(visitParams);
        },
        onPrefetched(response, visit) {
          params.onPrefetched(response, visit);
        },
        onPrefetchResponse(response) {
          resolve(response);
        },
        onPrefetchError(error) {
          prefetchedRequests.removeFromInFlight(params);
          reject(error);
        }
      });
    }).then((response) => {
      this.remove(params);
      const pageResponse = response.getPageResponse();
      page.mergeOncePropsIntoResponse(pageResponse);
      this.cached.push({
        params: { ...params },
        staleTimestamp: Date.now() + stale,
        expiresAt: Date.now() + prefetchExpiresIn,
        response: promise,
        singleUse: prefetchExpiresIn === 0,
        timestamp: Date.now(),
        inFlight: false,
        tags: Array.isArray(cacheTags) ? cacheTags : [cacheTags]
      });
      const oncePropExpiresIn = this.getShortestOncePropTtl(pageResponse);
      this.scheduleForRemoval(
        params,
        oncePropExpiresIn ? Math.min(prefetchExpiresIn, oncePropExpiresIn) : prefetchExpiresIn
      );
      this.removeFromInFlight(params);
      response.handlePrefetch();
      return response;
    });
    this.inFlightRequests.push({
      params: { ...params },
      response: promise,
      staleTimestamp: null,
      inFlight: true
    });
    return promise;
  }
  removeAll() {
    this.cached = [];
    this.removalTimers.forEach((removalTimer) => {
      clearTimeout(removalTimer.timer);
    });
    this.removalTimers = [];
  }
  removeByTags(tags) {
    this.cached = this.cached.filter((prefetched) => {
      return !prefetched.tags.some((tag) => tags.includes(tag));
    });
  }
  remove(params) {
    this.cached = this.cached.filter((prefetched) => {
      return !this.paramsAreEqual(prefetched.params, params);
    });
    this.clearTimer(params);
  }
  removeFromInFlight(params) {
    this.inFlightRequests = this.inFlightRequests.filter((prefetching) => {
      return !this.paramsAreEqual(prefetching.params, params);
    });
  }
  extractStaleValues(cacheFor) {
    const [stale, expires] = this.cacheForToStaleAndExpires(cacheFor);
    return [timeToMs(stale), timeToMs(expires)];
  }
  cacheForToStaleAndExpires(cacheFor) {
    if (!Array.isArray(cacheFor)) {
      return [cacheFor, cacheFor];
    }
    switch (cacheFor.length) {
      case 0:
        return [0, 0];
      case 1:
        return [cacheFor[0], cacheFor[0]];
      default:
        return [cacheFor[0], cacheFor[1]];
    }
  }
  clearTimer(params) {
    const timer = this.removalTimers.find((removalTimer) => {
      return this.paramsAreEqual(removalTimer.params, params);
    });
    if (timer) {
      clearTimeout(timer.timer);
      this.removalTimers = this.removalTimers.filter((removalTimer) => removalTimer !== timer);
    }
  }
  scheduleForRemoval(params, expiresIn) {
    if (typeof window === "undefined") {
      return;
    }
    this.clearTimer(params);
    if (expiresIn > 0) {
      const timer = window.setTimeout(() => this.remove(params), expiresIn);
      this.removalTimers.push({
        params,
        timer
      });
    }
  }
  get(params) {
    return this.findCached(params) || this.findInFlight(params);
  }
  use(prefetched, params) {
    const id = `${params.url.pathname}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    this.currentUseId = id;
    const consumedParams = {
      ...params,
      cached: true
    };
    return prefetched.response.then((response) => {
      if (this.currentUseId !== id) {
        return;
      }
      response.mergeParams({ ...consumedParams, onPrefetched: () => {
      } });
      this.removeSingleUseItems(params);
      return response.handle();
    });
  }
  removeSingleUseItems(params) {
    this.cached = this.cached.filter((prefetched) => {
      if (!this.paramsAreEqual(prefetched.params, params)) {
        return true;
      }
      return !prefetched.singleUse;
    });
  }
  findCached(params) {
    return this.cached.find((prefetched) => {
      return this.paramsAreEqual(prefetched.params, params);
    }) || null;
  }
  findInFlight(params) {
    return this.inFlightRequests.find((prefetched) => {
      return this.paramsAreEqual(prefetched.params, params);
    }) || null;
  }
  withoutPurposePrefetchHeader(params) {
    const newParams = cloneDeep(params);
    if (newParams.headers["Purpose"] === "prefetch") {
      delete newParams.headers["Purpose"];
    }
    return newParams;
  }
  paramsAreEqual(params1, params2) {
    return objectsAreEqual(
      this.withoutPurposePrefetchHeader(params1),
      this.withoutPurposePrefetchHeader(params2),
      [
        "id",
        "showProgress",
        "replace",
        "prefetch",
        "preserveScroll",
        "preserveState",
        "onBefore",
        "onBeforeUpdate",
        "onStart",
        "onProgress",
        "onFinish",
        "onCancel",
        "onSuccess",
        "onError",
        "onFlash",
        "onPrefetched",
        "onCancelToken",
        "onPrefetching",
        "async",
        "viewTransition",
        "optimistic",
        "component",
        "pageProps",
        "cached"
      ]
    );
  }
  updateCachedOncePropsFromCurrentPage() {
    this.cached.forEach((prefetched) => {
      prefetched.response.then((response) => {
        const pageResponse = response.getPageResponse();
        page.mergeOncePropsIntoResponse(pageResponse, { force: true });
        for (const [group, deferredProps] of Object.entries(pageResponse.deferredProps ?? {})) {
          const remaining = deferredProps.filter((prop) => get2(pageResponse.props, prop) === void 0);
          if (remaining.length > 0) {
            pageResponse.deferredProps[group] = remaining;
          } else {
            delete pageResponse.deferredProps[group];
          }
        }
        const oncePropExpiresIn = this.getShortestOncePropTtl(pageResponse);
        if (oncePropExpiresIn === null) {
          return;
        }
        const prefetchExpiresIn = prefetched.expiresAt - Date.now();
        const expiresIn = Math.min(prefetchExpiresIn, oncePropExpiresIn);
        if (expiresIn > 0) {
          this.scheduleForRemoval(prefetched.params, expiresIn);
        } else {
          this.remove(prefetched.params);
        }
      });
    });
  }
  getShortestOncePropTtl(page2) {
    const expiryTimestamps = Object.values(page2.onceProps ?? {}).map((onceProp) => onceProp.expiresAt).filter((expiresAt) => !!expiresAt);
    if (expiryTimestamps.length === 0) {
      return null;
    }
    return Math.min(...expiryTimestamps) - Date.now();
  }
};
var prefetchedRequests = new PrefetchedRequests();

// src/domUtils.ts
var elementInViewport = (el) => {
  if (el.offsetParent === null) {
    return false;
  }
  const rect = el.getBoundingClientRect();
  const verticallyVisible = rect.top < window.innerHeight && rect.bottom >= 0;
  const horizontallyVisible = rect.left < window.innerWidth && rect.right >= 0;
  return verticallyVisible && horizontallyVisible;
};
var getScrollableParent = (element) => {
  const allowsVerticalScroll = (el) => {
    const computedStyle = window.getComputedStyle(el);
    if (computedStyle.overflowY === "scroll") {
      return true;
    }
    if (computedStyle.overflowY !== "auto") {
      return false;
    }
    if (["visible", "clip"].includes(computedStyle.overflowX)) {
      return true;
    }
    return hasDimensionConstraint(computedStyle.maxHeight, el.style.height) || isConstrainedByLayout(el, "height");
  };
  const allowsHorizontalScroll = (el) => {
    const computedStyle = window.getComputedStyle(el);
    if (computedStyle.overflowX === "scroll") {
      return true;
    }
    if (computedStyle.overflowX !== "auto") {
      return false;
    }
    if (["visible", "clip"].includes(computedStyle.overflowY)) {
      return true;
    }
    return hasDimensionConstraint(computedStyle.maxWidth, el.style.width) || isConstrainedByLayout(el, "width");
  };
  const hasDimensionConstraint = (computedMaxDimension, inlineStyleDimension) => {
    if (computedMaxDimension && computedMaxDimension !== "none" && computedMaxDimension !== "0px") {
      return true;
    }
    if (inlineStyleDimension && inlineStyleDimension !== "auto" && inlineStyleDimension !== "0") {
      return true;
    }
    return false;
  };
  const isConstrainedByLayout = (el, dimension) => {
    const parent2 = el.parentElement;
    if (!parent2) {
      return false;
    }
    const parentStyle = window.getComputedStyle(parent2);
    if (["flex", "inline-flex"].includes(parentStyle.display)) {
      const isColumnLayout = ["column", "column-reverse"].includes(parentStyle.flexDirection);
      return dimension === "height" ? isColumnLayout : !isColumnLayout;
    }
    return ["grid", "inline-grid"].includes(parentStyle.display);
  };
  let parent = element?.parentElement;
  while (parent) {
    const allowsScroll = allowsVerticalScroll(parent) || allowsHorizontalScroll(parent);
    if (window.getComputedStyle(parent).display !== "contents" && allowsScroll) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
};
var getElementsInViewportFromCollection = (elements, referenceElement) => {
  if (!referenceElement) {
    return elements.filter((element) => elementInViewport(element));
  }
  const referenceIndex = elements.indexOf(referenceElement);
  const upwardElements = [];
  const downwardElements = [];
  for (let i = referenceIndex; i >= 0; i--) {
    const element = elements[i];
    if (elementInViewport(element)) {
      upwardElements.push(element);
    } else {
      break;
    }
  }
  for (let i = referenceIndex + 1; i < elements.length; i++) {
    const element = elements[i];
    if (elementInViewport(element)) {
      downwardElements.push(element);
    } else {
      break;
    }
  }
  return [...upwardElements.reverse(), ...downwardElements];
};
var requestAnimationFrame = (cb, times = 1) => {
  window.requestAnimationFrame(() => {
    if (times > 1) {
      requestAnimationFrame(cb, times - 1);
    } else {
      cb();
    }
  });
};
var getInitialPageFromDOM = (id) => {
  if (typeof window === "undefined") {
    return null;
  }
  const scriptEl = document.querySelector(`script[data-page="${id}"][type="application/json"]`);
  if (scriptEl?.textContent) {
    return JSON.parse(scriptEl.textContent);
  }
  return null;
};

// src/scroll.ts
var isServer = typeof window === "undefined";
var isFirefox = !isServer && /Firefox/i.test(window.navigator.userAgent);
var Scroll = class {
  static save() {
    history.saveScrollPositions(this.getScrollRegions());
  }
  static getScrollRegions() {
    return Array.from(this.regions()).map((region) => ({
      top: region.scrollTop,
      left: region.scrollLeft
    }));
  }
  static regions() {
    return document.querySelectorAll("[scroll-region]");
  }
  static scrollToTop() {
    if (isFirefox && getComputedStyle(document.documentElement).scrollBehavior === "smooth") {
      return requestAnimationFrame(() => window.scrollTo(0, 0), 2);
    }
    window.scrollTo(0, 0);
  }
  static reset() {
    const anchorHash = isServer ? null : window.location.hash;
    if (!anchorHash) {
      this.scrollToTop();
    }
    this.regions().forEach((region) => {
      if (typeof region.scrollTo === "function") {
        region.scrollTo(0, 0);
      } else {
        region.scrollTop = 0;
        region.scrollLeft = 0;
      }
    });
    this.save();
    this.scrollToAnchor();
  }
  static scrollToAnchor() {
    const anchorHash = isServer ? null : window.location.hash;
    if (anchorHash) {
      setTimeout(() => {
        const anchorElement = document.getElementById(anchorHash.slice(1));
        anchorElement ? anchorElement.scrollIntoView() : this.scrollToTop();
      });
    }
  }
  static restore(scrollRegions) {
    if (isServer) {
      return;
    }
    window.requestAnimationFrame(() => {
      this.restoreDocument();
      this.restoreScrollRegions(scrollRegions);
    });
  }
  static restoreScrollRegions(scrollRegions) {
    if (isServer) {
      return;
    }
    this.regions().forEach((region, index) => {
      const scrollPosition = scrollRegions[index];
      if (!scrollPosition) {
        return;
      }
      if (typeof region.scrollTo === "function") {
        region.scrollTo(scrollPosition.left, scrollPosition.top);
      } else {
        region.scrollTop = scrollPosition.top;
        region.scrollLeft = scrollPosition.left;
      }
    });
  }
  static restoreDocument() {
    const scrollPosition = history.getDocumentScrollPosition();
    window.scrollTo(scrollPosition.left, scrollPosition.top);
  }
  static onScroll(event) {
    const target = event.target;
    if (typeof target.hasAttribute === "function" && target.hasAttribute("scroll-region")) {
      this.save();
    }
  }
  static onWindowScroll() {
    history.saveDocumentScrollPosition({
      top: window.scrollY,
      left: window.scrollX
    });
  }
};

// src/files.ts
var isFile = (value) => typeof File !== "undefined" && value instanceof File || value instanceof Blob || typeof FileList !== "undefined" && value instanceof FileList && value.length > 0;
function hasFiles(data) {
  return isFile(data) || data instanceof FormData && Array.from(data.values()).some((value) => hasFiles(value)) || typeof data === "object" && data !== null && Object.values(data).some((value) => hasFiles(value));
}

// src/formData.ts
var isFormData = (value) => value instanceof FormData;
function objectToFormData(source, form = new FormData(), parentKey = null, queryStringArrayFormat = "brackets") {
  source = source || {};
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      append(form, composeKey(parentKey, key, "indices"), source[key], queryStringArrayFormat);
    }
  }
  return form;
}
function composeKey(parent, key, format) {
  if (!parent) {
    return key;
  }
  return format === "brackets" ? `${parent}[]` : `${parent}[${key}]`;
}
function append(form, key, value, format) {
  if (Array.isArray(value)) {
    return Array.from(value.keys()).forEach(
      (index) => append(form, composeKey(key, index.toString(), format), value[index], format)
    );
  } else if (value instanceof Date) {
    return form.append(key, value.toISOString());
  } else if (value instanceof File) {
    return form.append(key, value, value.name);
  } else if (value instanceof Blob) {
    return form.append(key, value);
  } else if (typeof value === "boolean") {
    return form.append(key, value ? "1" : "0");
  } else if (typeof value === "string") {
    return form.append(key, value);
  } else if (typeof value === "number") {
    return form.append(key, `${value}`);
  } else if (value === null || value === void 0) {
    return form.append(key, "");
  }
  objectToFormData(value, form, key, format);
}

// src/queryString.ts
function hasIndices(url) {
  return /\[\d+\]/.test(decodeURIComponent(url.search));
}
function parse(query) {
  if (!query || query === "?") {
    return {};
  }
  const result = {};
  query.replace(/^\?/, "").split("&").filter(Boolean).forEach((segment) => {
    const [rawKey, rawValue] = splitPair(segment);
    set2(result, decode(rawKey), decode(rawValue));
  });
  return result;
}
function stringify(data, arrayFormat) {
  const pairs = [];
  build(data, "", pairs, arrayFormat);
  return pairs.length ? "?" + pairs.join("&") : "";
}
function splitPair(pair) {
  const index = pair.indexOf("=");
  return index === -1 ? [pair, ""] : [pair.substring(0, index), pair.substring(index + 1)];
}
function decode(value) {
  return decodeURIComponent(value.replace(/\+/g, " "));
}
function set2(target, key, value) {
  const keys = parseKey(key);
  if (keys.some((k) => k === "__proto__")) {
    return;
  }
  let current = target;
  while (keys.length > 1) {
    const segment = keys.shift();
    const nextIsArrayPush = keys[0] === "";
    if (typeof current[segment] !== "object" || current[segment] === null) {
      current[segment] = nextIsArrayPush ? [] : {};
    }
    current = current[segment];
  }
  const final = keys.shift();
  if (final === "" && Array.isArray(current)) {
    current.push(value);
  } else {
    current[final] = value;
  }
}
function parseKey(key) {
  const segments = [];
  const base = key.split("[")[0];
  if (base) {
    segments.push(base);
  }
  let match;
  const pattern = /\[([^\]]*)\]/g;
  while ((match = pattern.exec(key)) !== null) {
    segments.push(match[1]);
  }
  return segments;
}
function build(value, prefix, pairs, arrayFormat) {
  if (value === void 0) {
    return;
  }
  if (value === null) {
    pairs.push(`${prefix}=`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const key = arrayFormat === "indices" ? `${prefix}[${index}]` : `${prefix}[]`;
      build(item, key, pairs, arrayFormat);
    });
    return;
  }
  if (typeof value === "object") {
    Object.keys(value).forEach((key) => {
      build(value[key], prefix ? `${prefix}[${key}]` : key, pairs, arrayFormat);
    });
    return;
  }
  pairs.push(`${prefix}=${encodeURIComponent(String(value))}`);
}

// src/url.ts
function hrefToUrl(href) {
  return new URL(href.toString(), typeof window === "undefined" ? void 0 : window.location.toString());
}
var transformUrlAndData = (href, data, method, forceFormData, queryStringArrayFormat) => {
  let url = typeof href === "string" ? hrefToUrl(href) : href;
  if ((hasFiles(data) || forceFormData) && !isFormData(data)) {
    if (config.get("form.forceIndicesArrayFormatInFormData")) {
      queryStringArrayFormat = "indices";
    }
    data = objectToFormData(data, new FormData(), null, queryStringArrayFormat);
  }
  if (isFormData(data)) {
    return [url, data];
  }
  const [_href, _data] = mergeDataIntoQueryString(method, url, data, queryStringArrayFormat);
  return [hrefToUrl(_href), _data];
};
function mergeDataIntoQueryString(method, href, data, qsArrayFormat = "brackets") {
  const hasDataForQueryString = method === "get" && !isFormData(data) && Object.keys(data).length > 0;
  const hasHost = urlHasProtocol(href.toString());
  const hasAbsolutePath = hasHost || href.toString().startsWith("/") || href.toString() === "";
  const hasRelativePath = !hasAbsolutePath && !href.toString().startsWith("#") && !href.toString().startsWith("?");
  const hasRelativePathWithDotPrefix = /^[.]{1,2}([/]|$)/.test(href.toString());
  const hasSearch = href.toString().includes("?") || hasDataForQueryString;
  const hasHash = href.toString().includes("#");
  const url = new URL(href.toString(), typeof window === "undefined" ? "http://localhost" : window.location.toString());
  if (hasDataForQueryString) {
    const arrayFormat = hasIndices(url) ? "indices" : qsArrayFormat;
    url.search = stringify({ ...parse(url.search), ...data }, arrayFormat);
  }
  return [
    [
      hasHost ? `${url.protocol}//${url.host}` : "",
      hasAbsolutePath ? url.pathname : "",
      hasRelativePath ? url.pathname.substring(hasRelativePathWithDotPrefix ? 0 : 1) : "",
      hasSearch ? url.search : "",
      hasHash ? url.hash : ""
    ].join(""),
    hasDataForQueryString ? {} : data
  ];
}
function urlWithoutHash(url) {
  url = new URL(url.href);
  url.hash = "";
  return url;
}
var setHashIfSameUrl = (originUrl, destinationUrl) => {
  if (originUrl.hash && !destinationUrl.hash && urlWithoutHash(originUrl).href === destinationUrl.href) {
    destinationUrl.hash = originUrl.hash;
  }
};
var isSameUrlWithoutHash = (url1, url2) => {
  return urlWithoutHash(url1).href === urlWithoutHash(url2).href;
};
var isSameUrlWithoutQueryOrHash = (url1, url2) => {
  return url1.origin === url2.origin && url1.pathname === url2.pathname;
};
function isUrlMethodPair(href) {
  return href !== null && typeof href === "object" && href !== void 0 && "url" in href && "method" in href;
}
function resolveUrlMethodPairComponent(pair) {
  if (!pair.component) {
    return null;
  }
  if (typeof pair.component !== "string") {
    console.error(
      `The "component" property on the URL method pair received multiple components (${Object.keys(pair.component).join(", ")}), but only a single component string is supported for instant visits. Use the withComponent() method to specify which component to use.`
    );
    return null;
  }
  return pair.component;
}
function urlHasProtocol(url) {
  return /^([a-z][a-z0-9+.-]*:)?\/\/[^/]/i.test(url);
}
function urlToString(url, absolute) {
  const urlObj = typeof url === "string" ? hrefToUrl(url) : url;
  return absolute ? `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}${urlObj.search}${urlObj.hash}` : `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
}

// src/page.ts
var CurrentPage = class {
  page;
  swapComponent;
  resolveComponent;
  onFlashCallback;
  componentId = {};
  listeners = [];
  isFirstPageLoad = true;
  cleared = false;
  pendingDeferredProps = null;
  historyQuotaExceeded = false;
  optimisticBaseline = {};
  pendingOptimistics = [];
  optimisticCounter = 0;
  init({
    initialPage,
    swapComponent,
    resolveComponent,
    onFlash
  }) {
    this.page = { ...initialPage, flash: initialPage.flash ?? {}, rescuedProps: initialPage.rescuedProps ?? [] };
    this.swapComponent = swapComponent;
    this.resolveComponent = resolveComponent;
    this.onFlashCallback = onFlash;
    eventHandler.on("historyQuotaExceeded", () => {
      this.historyQuotaExceeded = true;
    });
    return this;
  }
  set(page2, {
    replace = false,
    preserveScroll = false,
    preserveState = false,
    viewTransition = false,
    cached = false,
    initialRender = false,
    visitId
  } = {}) {
    if (Object.keys(page2.deferredProps || {}).length) {
      this.pendingDeferredProps = {
        deferredProps: page2.deferredProps,
        component: page2.component,
        url: page2.url
      };
      if (page2.initialDeferredProps === void 0) {
        page2.initialDeferredProps = page2.deferredProps;
      }
    }
    this.componentId = {};
    const componentId = this.componentId;
    if (page2.clearHistory) {
      history.clear();
    }
    return this.resolve(page2.component, page2).then((component) => {
      if (componentId !== this.componentId) {
        return;
      }
      page2.rememberedState ??= {};
      const isServer3 = typeof window === "undefined";
      const location = !isServer3 ? window.location : new URL(page2.url);
      const scrollRegions = !isServer3 && preserveScroll ? Scroll.getScrollRegions() : [];
      replace = replace || isSameUrlWithoutHash(hrefToUrl(page2.url), location);
      const pageForHistory = { ...page2, flash: {} };
      return new Promise(
        (resolve) => replace ? history.replaceState(pageForHistory, resolve) : history.pushState(pageForHistory, resolve)
      ).then(() => {
        const isNewComponent = !this.isTheSame(page2);
        if (!isNewComponent && Object.keys(page2.props.errors || {}).length > 0) {
          viewTransition = false;
        }
        this.page = page2;
        this.cleared = false;
        if (this.hasOnceProps()) {
          prefetchedRequests.updateCachedOncePropsFromCurrentPage();
        }
        if (isNewComponent) {
          this.fireEventsFor("newComponent");
        }
        if (this.isFirstPageLoad) {
          this.fireEventsFor("firstLoad");
        }
        this.isFirstPageLoad = false;
        if (this.historyQuotaExceeded) {
          this.historyQuotaExceeded = false;
          return;
        }
        return this.swap({
          component,
          page: page2,
          preserveState,
          viewTransition,
          initialRender
        }).then(() => {
          if (preserveScroll) {
            window.requestAnimationFrame(() => Scroll.restoreScrollRegions(scrollRegions));
          } else {
            Scroll.reset();
          }
          if (this.pendingDeferredProps && this.pendingDeferredProps.component === page2.component && this.pendingDeferredProps.url === page2.url) {
            eventHandler.fireInternalEvent("loadDeferredProps", this.pendingDeferredProps.deferredProps);
          }
          this.pendingDeferredProps = null;
          if (!replace) {
            fireNavigateEvent(page2, { cached, visitId });
          }
        });
      });
    });
  }
  setQuietly(page2, {
    preserveState = false
  } = {}) {
    return this.resolve(page2.component, page2).then((component) => {
      this.page = page2;
      this.cleared = false;
      history.setCurrent(page2);
      return this.swap({ component, page: page2, preserveState, viewTransition: false });
    });
  }
  clear() {
    this.cleared = true;
  }
  isCleared() {
    return this.cleared;
  }
  get() {
    return this.page;
  }
  getWithoutFlashData() {
    return { ...this.page, flash: {} };
  }
  hasOnceProps() {
    return Object.keys(this.page.onceProps ?? {}).length > 0;
  }
  merge(data) {
    this.page = { ...this.page, ...data };
  }
  setPropsQuietly(props) {
    this.page = { ...this.page, props };
    return this.resolve(this.page.component, this.page).then((component) => {
      return this.swap({ component, page: this.page, preserveState: true, viewTransition: false });
    });
  }
  setFlash(flash) {
    this.page = { ...this.page, flash };
    this.onFlashCallback?.(flash);
  }
  setUrlHash(hash) {
    if (!this.page.url.includes(hash)) {
      this.page.url += hash;
    }
  }
  remember(data) {
    this.page.rememberedState = data;
  }
  swap({
    component,
    page: page2,
    preserveState,
    viewTransition,
    initialRender = false
  }) {
    const doSwap = () => this.swapComponent({ component, page: page2, preserveState, initialRender });
    if (!viewTransition || !document?.startViewTransition || document.visibilityState === "hidden") {
      return doSwap();
    }
    const viewTransitionCallback = typeof viewTransition === "boolean" ? () => null : viewTransition;
    const ignoreSkippedTransition = (promise) => {
      promise.catch((error) => {
        if (!(error instanceof DOMException)) {
          throw error;
        }
      });
    };
    return new Promise((resolve) => {
      const transitionResult = document.startViewTransition(() => doSwap().then(resolve));
      ignoreSkippedTransition(transitionResult.ready);
      ignoreSkippedTransition(transitionResult.finished);
      ignoreSkippedTransition(transitionResult.updateCallbackDone);
      viewTransitionCallback(transitionResult);
    });
  }
  resolve(component, page2) {
    return Promise.resolve(this.resolveComponent(component, page2));
  }
  nextOptimisticId() {
    return ++this.optimisticCounter;
  }
  setBaseline(key, value) {
    if (!(key in this.optimisticBaseline)) {
      this.optimisticBaseline[key] = value;
    }
  }
  updateBaseline(key, value) {
    if (key in this.optimisticBaseline) {
      this.optimisticBaseline[key] = value;
    }
  }
  hasBaseline(key) {
    return key in this.optimisticBaseline;
  }
  registerOptimistic(id, callback) {
    this.pendingOptimistics.push({ id, callback });
  }
  unregisterOptimistic(id) {
    this.pendingOptimistics = this.pendingOptimistics.filter((entry) => entry.id !== id);
  }
  replayOptimistics() {
    const baselineKeys = Object.keys(this.optimisticBaseline);
    if (baselineKeys.length === 0) {
      return {};
    }
    const props = cloneDeep2(this.page.props);
    for (const key of baselineKeys) {
      props[key] = cloneDeep2(this.optimisticBaseline[key]);
    }
    for (const { callback } of this.pendingOptimistics) {
      const result = callback(cloneDeep2(props));
      if (result) {
        Object.assign(props, result);
      }
    }
    const replayedProps = {};
    for (const key of baselineKeys) {
      replayedProps[key] = props[key];
    }
    return replayedProps;
  }
  pendingOptimisticCount() {
    return this.pendingOptimistics.length;
  }
  clearOptimisticState() {
    this.optimisticBaseline = {};
    this.pendingOptimistics = [];
  }
  isTheSame(page2) {
    return this.page.component === page2.component;
  }
  on(event, callback) {
    this.listeners.push({ event, callback });
    return () => {
      this.listeners = this.listeners.filter((listener) => listener.event !== event && listener.callback !== callback);
    };
  }
  fireEventsFor(event) {
    this.listeners.filter((listener) => listener.event === event).forEach((listener) => listener.callback());
  }
  mergeOncePropsIntoResponse(response, { force = false } = {}) {
    Object.entries(response.onceProps ?? {}).forEach(([key, onceProp]) => {
      const existingOnceProp = this.page.onceProps?.[key];
      if (existingOnceProp === void 0) {
        return;
      }
      if (force || get3(response.props, onceProp.prop) === void 0) {
        set3(response.props, onceProp.prop, get3(this.page.props, existingOnceProp.prop));
        response.onceProps[key].expiresAt = existingOnceProp.expiresAt;
      }
    });
  }
};
var page = new CurrentPage();

// src/queue.ts
var Queue = class {
  items = [];
  processingPromise = null;
  add(item) {
    this.items.push(item);
    return this.process();
  }
  process() {
    this.processingPromise ??= this.processNext().finally(() => {
      this.processingPromise = null;
    });
    return this.processingPromise;
  }
  processNext() {
    const next = this.items.shift();
    if (next) {
      return Promise.resolve(next()).then(() => this.processNext());
    }
    return Promise.resolve();
  }
};

// src/history.ts
var isServer2 = typeof window === "undefined";
var queue = new Queue();
var isChromeIOS = !isServer2 && /CriOS/.test(window.navigator.userAgent);
var History = class {
  rememberedState = "rememberedState";
  scrollRegions = "scrollRegions";
  preserveUrl = false;
  current = {};
  // We need initialState for `restore`
  initialState = null;
  remember(data, key) {
    this.replaceState({
      ...page.getWithoutFlashData(),
      rememberedState: {
        ...page.get()?.rememberedState ?? {},
        [key]: data
      }
    });
  }
  restore(key) {
    if (!isServer2) {
      return this.current[this.rememberedState]?.[key] !== void 0 ? this.current[this.rememberedState]?.[key] : this.initialState?.[this.rememberedState]?.[key];
    }
  }
  pushState(page2, cb = null) {
    if (isServer2) {
      return;
    }
    if (this.preserveUrl) {
      cb && cb();
      return;
    }
    this.current = page2;
    queue.add(() => {
      return this.getPageData(page2).then((data) => {
        const doPush = () => this.doPushState({ page: data }, page2.url).then(() => cb?.());
        if (isChromeIOS) {
          return new Promise((resolve) => {
            setTimeout(() => doPush().then(resolve));
          });
        }
        return doPush();
      });
    });
  }
  clonePageProps(page2) {
    try {
      structuredClone(page2.props);
      return page2;
    } catch {
      return {
        ...page2,
        props: cloneDeep3(page2.props)
      };
    }
  }
  getPageData(page2) {
    const pageWithClonedProps = this.clonePageProps(page2);
    return new Promise((resolve) => {
      return page2.encryptHistory ? encryptHistory(pageWithClonedProps).then(resolve) : resolve(pageWithClonedProps);
    });
  }
  processQueue() {
    return queue.process();
  }
  decrypt(page2 = null) {
    if (isServer2) {
      return Promise.resolve(page2 ?? page.get());
    }
    const pageData = page2 ?? window.history.state?.page;
    return this.decryptPageData(pageData).then((data) => {
      if (!data) {
        throw new Error("Unable to decrypt history");
      }
      if (this.initialState === null) {
        this.initialState = data ?? void 0;
      } else {
        this.current = data ?? {};
      }
      return data;
    });
  }
  decryptPageData(pageData) {
    return pageData instanceof ArrayBuffer ? decryptHistory(pageData) : Promise.resolve(pageData);
  }
  saveScrollPositions(scrollRegions) {
    queue.add(() => {
      return Promise.resolve().then(() => {
        if (!window.history.state?.page) {
          return;
        }
        if (isEqual(this.getScrollRegions(), scrollRegions)) {
          return;
        }
        return this.doReplaceState({
          page: window.history.state.page,
          scrollRegions
        });
      });
    });
  }
  saveDocumentScrollPosition(scrollRegion) {
    queue.add(() => {
      return Promise.resolve().then(() => {
        if (!window.history.state?.page) {
          return;
        }
        if (isEqual(this.getDocumentScrollPosition(), scrollRegion)) {
          return;
        }
        return this.doReplaceState({
          page: window.history.state.page,
          documentScrollPosition: scrollRegion
        });
      });
    });
  }
  getScrollRegions() {
    return window.history.state?.scrollRegions || [];
  }
  getDocumentScrollPosition() {
    return window.history.state?.documentScrollPosition || { top: 0, left: 0 };
  }
  replaceState(page2, cb = null) {
    if (isEqual(this.current, page2)) {
      cb && cb();
      return;
    }
    const { flash, ...pageWithoutFlash } = page2;
    page.merge(pageWithoutFlash);
    if (isServer2) {
      return;
    }
    if (this.preserveUrl) {
      cb && cb();
      return;
    }
    this.current = page2;
    queue.add(() => {
      return this.getPageData(page2).then((data) => {
        const doReplace = () => this.doReplaceState({ page: data }, page2.url).then(() => cb?.());
        if (isChromeIOS) {
          return new Promise((resolve) => {
            setTimeout(() => doReplace().then(resolve));
          });
        }
        return doReplace();
      });
    });
  }
  isHistoryThrottleError(error) {
    return error instanceof Error && error.name === "SecurityError" && (error.message.includes("history.pushState") || error.message.includes("history.replaceState"));
  }
  isQuotaExceededError(error) {
    return error instanceof Error && error.name === "QuotaExceededError";
  }
  withThrottleProtection(cb) {
    return Promise.resolve().then(() => {
      try {
        return cb();
      } catch (error) {
        if (!this.isHistoryThrottleError(error)) {
          throw error;
        }
        console.error(error.message);
      }
    });
  }
  doReplaceState(data, url) {
    return this.withThrottleProtection(() => {
      window.history.replaceState(
        {
          ...data,
          scrollRegions: data.scrollRegions ?? window.history.state?.scrollRegions,
          documentScrollPosition: data.documentScrollPosition ?? window.history.state?.documentScrollPosition
        },
        "",
        url
      );
    });
  }
  doPushState(data, url) {
    return this.withThrottleProtection(() => {
      try {
        window.history.pushState(data, "", url);
      } catch (error) {
        if (!this.isQuotaExceededError(error)) {
          throw error;
        }
        eventHandler.fireInternalEvent("historyQuotaExceeded", url);
      }
    });
  }
  getState(key, defaultValue) {
    return this.current?.[key] ?? defaultValue;
  }
  deleteState(key) {
    if (this.current[key] !== void 0) {
      delete this.current[key];
      this.replaceState(this.current);
    }
  }
  clearInitialState(key) {
    if (this.initialState && this.initialState[key] !== void 0) {
      delete this.initialState[key];
    }
  }
  browserHasHistoryEntry() {
    return !isServer2 && !!window.history.state?.page;
  }
  clear() {
    SessionStorage.remove(historySessionStorageKeys.key);
    SessionStorage.remove(historySessionStorageKeys.iv);
  }
  setCurrent(page2) {
    this.current = page2;
  }
  isValidState(state) {
    return !!state.page;
  }
  getAllState() {
    return this.current;
  }
};
if (typeof window !== "undefined" && window.history.scrollRestoration) {
  window.history.scrollRestoration = "manual";
}
var history = new History();

// src/eventHandler.ts
var EventHandler = class {
  internalListeners = [];
  init() {
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", this.handlePopstateEvent.bind(this));
      window.addEventListener("pageshow", this.handlePageshowEvent.bind(this));
      window.addEventListener("scroll", debounce(Scroll.onWindowScroll.bind(Scroll), 100), true);
    }
    if (typeof document !== "undefined") {
      document.addEventListener("scroll", debounce(Scroll.onScroll.bind(Scroll), 100), true);
    }
  }
  onGlobalEvent(type, callback) {
    const listener = ((event) => {
      const response = callback(event);
      if (event.cancelable && !event.defaultPrevented && response === false) {
        event.preventDefault();
      }
    });
    return this.registerListener(`inertia:${type}`, listener);
  }
  on(event, callback) {
    this.internalListeners.push({ event, listener: callback });
    return () => {
      this.internalListeners = this.internalListeners.filter((listener) => listener.listener !== callback);
    };
  }
  onMissingHistoryItem() {
    page.clear();
    this.fireInternalEvent("missingHistoryItem");
  }
  fireInternalEvent(event, ...args) {
    this.internalListeners.filter((listener) => listener.event === event).forEach((listener) => listener.listener(...args));
  }
  registerListener(type, listener) {
    document.addEventListener(type, listener);
    return () => document.removeEventListener(type, listener);
  }
  // bfcache restores pages without firing `popstate`, so we use `pageshow` to
  // re-validate encrypted history entries after `clearHistory` removed the keys.
  // https://web.dev/articles/bfcache
  handlePageshowEvent(event) {
    if (event.persisted) {
      history.decrypt().catch(() => this.onMissingHistoryItem());
    }
  }
  handlePopstateEvent(event) {
    const state = event.state || null;
    if (state === null) {
      const url = hrefToUrl(page.get().url);
      url.hash = window.location.hash;
      history.replaceState({ ...page.getWithoutFlashData(), url: url.href });
      Scroll.reset();
      return;
    }
    if (!history.isValidState(state)) {
      return this.onMissingHistoryItem();
    }
    history.decrypt(state.page).then((data) => {
      if (page.get().version !== data.version) {
        this.onMissingHistoryItem();
        return;
      }
      router.cancelAll({ prefetch: false });
      page.setQuietly(data, { preserveState: false }).then(() => {
        Scroll.restore(history.getScrollRegions());
        fireNavigateEvent(page.get());
        const pendingDeferred = {};
        const pageProps = page.get().props;
        for (const [group, props] of Object.entries(data.initialDeferredProps ?? data.deferredProps ?? {})) {
          const missing = props.filter((prop) => get4(pageProps, prop) === void 0);
          if (missing.length > 0) {
            pendingDeferred[group] = missing;
          }
        }
        if (Object.keys(pendingDeferred).length > 0) {
          this.fireInternalEvent("loadDeferredProps", pendingDeferred);
        }
      });
    }).catch(() => {
      this.onMissingHistoryItem();
    });
  }
};
var eventHandler = new EventHandler();

// src/navigationType.ts
var NavigationType = class {
  type;
  constructor() {
    this.type = this.resolveType();
  }
  resolveType() {
    if (typeof window === "undefined") {
      return "navigate";
    }
    const entry = window.performance?.getEntriesByType("navigation")[0];
    return entry?.type ?? "navigate";
  }
  get() {
    return this.type;
  }
  isBackForward() {
    return this.type === "back_forward";
  }
  isReload() {
    return this.type === "reload";
  }
};
var navigationType = new NavigationType();

// src/uid.ts
function uid() {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : void 0;
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  const randomByte = () => cryptoObj?.getRandomValues ? cryptoObj.getRandomValues(new Uint8Array(1))[0] : Math.floor(Math.random() * 256);
  return "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    (c) => (+c ^ randomByte() & 15 >> +c / 4).toString(16)
  );
}

// src/initialVisit.ts
var InitialVisit = class {
  static handle() {
    this.clearRememberedStateOnReload();
    const scenarios = [this.handleBackForward, this.handleLocation, this.handleDefault];
    scenarios.find((handler) => handler.bind(this)());
  }
  static clearRememberedStateOnReload() {
    if (navigationType.isReload()) {
      history.deleteState(history.rememberedState);
      history.clearInitialState(history.rememberedState);
    }
  }
  static handleBackForward() {
    if (!navigationType.isBackForward() || !history.browserHasHistoryEntry()) {
      return false;
    }
    const scrollRegions = history.getScrollRegions();
    history.decrypt().then((data) => {
      const visitId = uid();
      page.set(data, { preserveScroll: true, preserveState: true, visitId }).then(() => {
        Scroll.restore(scrollRegions);
        fireNavigateEvent(page.get(), { visitId });
      });
    }).catch(() => {
      eventHandler.onMissingHistoryItem();
    });
    return true;
  }
  /**
   * @link https://inertiajs.com/redirects#external-redirects
   */
  static handleLocation() {
    if (!SessionStorage.exists(SessionStorage.locationVisitKey)) {
      return false;
    }
    const locationVisit = SessionStorage.get(SessionStorage.locationVisitKey) || {};
    SessionStorage.remove(SessionStorage.locationVisitKey);
    if (typeof window !== "undefined") {
      page.setUrlHash(window.location.hash);
    }
    history.decrypt(page.get()).then(() => {
      const visitId = uid();
      const rememberedState = history.getState(history.rememberedState, {});
      const scrollRegions = history.getScrollRegions();
      page.remember(rememberedState);
      page.set(page.get(), {
        preserveScroll: locationVisit.preserveScroll,
        preserveState: true,
        initialRender: true,
        visitId
      }).then(() => {
        if (locationVisit.preserveScroll) {
          Scroll.restore(scrollRegions);
        }
        this.fireInitialEvents(visitId);
      });
    }).catch(() => {
      eventHandler.onMissingHistoryItem();
    });
    return true;
  }
  static handleDefault() {
    if (typeof window !== "undefined") {
      page.setUrlHash(window.location.hash);
    }
    const visitId = uid();
    page.set(page.get(), { preserveScroll: true, preserveState: true, initialRender: true, visitId }).then(() => {
      if (navigationType.isReload()) {
        Scroll.restore(history.getScrollRegions());
      } else {
        Scroll.scrollToAnchor();
      }
      this.fireInitialEvents(visitId);
    });
  }
  static fireInitialEvents(visitId) {
    const page2 = page.get();
    fireNavigateEvent(page2, { visitId });
    if (Object.keys(page2.flash).length > 0) {
      queueMicrotask(() => fireFlashEvent(page2.flash));
    }
  }
};

// src/poll.ts
var Poll = class {
  intervalId = null;
  timeoutId = null;
  throttle = false;
  keepAlive = false;
  cb;
  interval;
  cbCount = 0;
  mode;
  inFlight = false;
  currentCancel = null;
  stopped = true;
  instanceId = 0;
  constructor(interval, cb, options) {
    this.keepAlive = options.keepAlive ?? false;
    this.mode = options.mode ?? "overlap";
    this.cb = cb;
    this.interval = interval;
    if (options.autoStart ?? true) {
      this.start();
    }
  }
  stop() {
    this.stopped = true;
    this.instanceId++;
    this.inFlight = false;
    this.currentCancel = null;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  start() {
    if (typeof window === "undefined") {
      return;
    }
    this.stop();
    this.stopped = false;
    if (this.mode === "rest") {
      this.scheduleNext();
      return;
    }
    this.intervalId = window.setInterval(() => this.tick(), this.interval);
  }
  isInBackground(hidden2) {
    this.throttle = this.keepAlive ? false : hidden2;
    if (this.throttle) {
      this.cbCount = 0;
    }
  }
  scheduleNext() {
    if (this.stopped) {
      return;
    }
    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null;
      this.tick();
    }, this.interval);
  }
  tick() {
    if (!this.throttle || this.cbCount % 10 === 0) {
      this.fire();
    } else if (this.mode === "rest") {
      this.scheduleNext();
    }
    if (this.throttle) {
      this.cbCount++;
    }
  }
  fire() {
    if (this.inFlight && this.mode === "cancel") {
      this.currentCancel?.();
    }
    const instance = this.instanceId;
    this.cb({
      onStart: (cancel) => {
        if (instance !== this.instanceId) {
          return;
        }
        this.inFlight = true;
        this.currentCancel = cancel;
      },
      onFinish: () => {
        if (instance !== this.instanceId) {
          return;
        }
        this.inFlight = false;
        this.currentCancel = null;
        if (this.mode === "rest") {
          this.scheduleNext();
        }
      }
    });
  }
};

// src/polls.ts
var Polls = class {
  polls = [];
  constructor() {
    this.setupVisibilityListener();
  }
  get count() {
    return this.polls.length;
  }
  add(interval, cb, options) {
    const poll = new Poll(interval, cb, options);
    this.polls.push(poll);
    return {
      stop: () => poll.stop(),
      start: () => poll.start(),
      destroy: () => {
        poll.stop();
        this.polls = this.polls.filter((p) => p !== poll);
      }
    };
  }
  clear() {
    this.polls.forEach((poll) => poll.stop());
    this.polls = [];
  }
  setupVisibilityListener() {
    if (typeof document === "undefined") {
      return;
    }
    document.addEventListener(
      "visibilitychange",
      () => {
        this.polls.forEach((poll) => poll.isInBackground(document.hidden));
      },
      false
    );
  }
};
var polls = new Polls();

// src/request.ts
import { get as get6 } from "es-toolkit/compat";

// src/http.ts
import { client as precognitionClient } from "laravel-precognition";

// src/httpHandlers.ts
var HttpHandlers = class {
  requestHandlers = [];
  responseHandlers = [];
  errorHandlers = [];
  onRequest(handler) {
    this.requestHandlers.push(handler);
    return () => {
      this.requestHandlers = this.requestHandlers.filter((h) => h !== handler);
    };
  }
  onResponse(handler) {
    this.responseHandlers.push(handler);
    return () => {
      this.responseHandlers = this.responseHandlers.filter((h) => h !== handler);
    };
  }
  onError(handler) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
    };
  }
  async processRequest(config2) {
    let result = config2;
    for (const handler of this.requestHandlers) {
      result = await handler(result);
    }
    return result;
  }
  async processResponse(response) {
    let result = response;
    for (const handler of this.responseHandlers) {
      result = await handler(result);
    }
    return result;
  }
  async processError(error) {
    for (const handler of this.errorHandlers) {
      await handler(error);
    }
  }
};
var httpHandlers = new HttpHandlers();

// src/httpErrors.ts
var HttpError = class extends Error {
  code;
  url;
  constructor(message, code, url) {
    super(url ? `${message} (${url})` : message);
    this.name = "HttpError";
    this.code = code;
    this.url = url;
  }
};
var HttpResponseError = class extends HttpError {
  response;
  constructor(message, response, url) {
    super(message, "ERR_HTTP_RESPONSE", url);
    this.name = "HttpResponseError";
    this.response = response;
  }
};
var HttpCancelledError = class extends HttpError {
  constructor(message = "Request was cancelled", url) {
    super(message, "ERR_CANCELLED", url);
    this.name = "HttpCancelledError";
  }
};
var HttpNetworkError = class extends HttpError {
  cause;
  constructor(message, url, cause) {
    super(message, "ERR_NETWORK", url);
    this.name = "HttpNetworkError";
    this.cause = cause;
  }
};

// src/xhrHttpClient.ts
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}
function parseHeaders(xhr) {
  const headers = {};
  xhr.getAllResponseHeaders().split("\r\n").forEach((line) => {
    const index = line.indexOf(":");
    if (index > 0) {
      headers[line.slice(0, index).toLowerCase().trim()] = line.slice(index + 1).trim();
    }
  });
  return headers;
}
function isFormDataRequestBody(value) {
  return typeof FormData !== "undefined" && value instanceof FormData;
}
function isRawRequestBody(value) {
  return typeof value === "string" || isFormDataRequestBody(value) || typeof Blob !== "undefined" && value instanceof Blob || typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer || typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(value) || typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams;
}
function setHeaders(xhr, config2) {
  if (!config2.headers) {
    return;
  }
  const isFormData2 = isFormDataRequestBody(config2.data);
  Object.entries(config2.headers).forEach(([key, value]) => {
    if (key.toLowerCase() !== "content-type" || !isFormData2) {
      xhr.setRequestHeader(key, String(value));
    }
  });
}
function buildUrlWithParams(url, params) {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  const [urlWithParams] = mergeDataIntoQueryString("get", url, params);
  return urlWithParams;
}
var XhrHttpClient = class {
  xsrfCookieName;
  xsrfHeaderName;
  constructor(options = {}) {
    this.xsrfCookieName = options.xsrfCookieName ?? "XSRF-TOKEN";
    this.xsrfHeaderName = options.xsrfHeaderName ?? "X-XSRF-TOKEN";
  }
  async request(config2) {
    const processedConfig = await httpHandlers.processRequest(config2);
    try {
      const response = await this.doRequest(processedConfig);
      return await httpHandlers.processResponse(response);
    } catch (error) {
      if (error instanceof HttpResponseError || error instanceof HttpNetworkError || error instanceof HttpCancelledError) {
        await httpHandlers.processError(error);
      }
      throw error;
    }
  }
  doRequest(config2) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = buildUrlWithParams(config2.url, config2.params);
      xhr.open(config2.method.toUpperCase(), url, true);
      const xsrfToken = getCookie(this.xsrfCookieName);
      if (xsrfToken) {
        xhr.setRequestHeader(this.xsrfHeaderName, xsrfToken);
      }
      const hasRequestedWithHeader = Object.keys(config2.headers ?? {}).some(
        (key) => key.toLowerCase() === "x-requested-with"
      );
      if (!hasRequestedWithHeader) {
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      }
      let body = null;
      if (config2.data !== null && config2.data !== void 0) {
        if (isRawRequestBody(config2.data)) {
          body = config2.data;
        } else if (typeof config2.data === "object") {
          body = JSON.stringify(config2.data);
          if (!config2.headers?.["Content-Type"] && !config2.headers?.["content-type"]) {
            xhr.setRequestHeader("Content-Type", "application/json");
          }
        } else {
          body = String(config2.data);
        }
      }
      setHeaders(xhr, config2);
      if (config2.onUploadProgress) {
        xhr.upload.onprogress = (event) => {
          const progress3 = event.lengthComputable ? event.loaded / event.total : void 0;
          config2.onUploadProgress({
            progress: progress3,
            percentage: progress3 ? Math.round(progress3 * 100) : 0,
            loaded: event.loaded,
            total: event.lengthComputable ? event.total : void 0
          });
        };
      }
      if (config2.signal) {
        config2.signal.addEventListener("abort", () => xhr.abort());
      }
      xhr.onabort = () => reject(new HttpCancelledError("Request was cancelled", config2.url));
      xhr.onerror = () => reject(new HttpNetworkError("Network error", config2.url));
      xhr.onload = () => {
        const response = {
          status: xhr.status,
          data: xhr.responseText,
          headers: parseHeaders(xhr)
        };
        if (xhr.status >= 400) {
          reject(new HttpResponseError(`Request failed with status ${xhr.status}`, response, config2.url));
        } else {
          resolve(response);
        }
      };
      xhr.send(body);
    });
  }
};
var xhrHttpClient = new XhrHttpClient();

// src/http.ts
var httpClient = xhrHttpClient;
function isHttpClientOptions(client) {
  return !("request" in client);
}
var http = {
  /**
   * Get the current HTTP client
   */
  getClient() {
    return httpClient;
  },
  /**
   * Set the HTTP client to use for all Inertia requests
   */
  setClient(clientOrOptions) {
    if (!isHttpClientOptions(clientOrOptions)) {
      httpClient = clientOrOptions;
      return;
    }
    httpClient = new XhrHttpClient(clientOrOptions);
    if (clientOrOptions.xsrfCookieName) {
      precognitionClient.withXsrfCookieName(clientOrOptions.xsrfCookieName);
    }
    if (clientOrOptions.xsrfHeaderName) {
      precognitionClient.withXsrfHeaderName(clientOrOptions.xsrfHeaderName);
    }
  },
  /**
   * Register a request handler that runs before each request
   */
  onRequest: httpHandlers.onRequest.bind(httpHandlers),
  /**
   * Register a response handler that runs after each successful response
   */
  onResponse: httpHandlers.onResponse.bind(httpHandlers),
  /**
   * Register an error handler that runs when a request fails
   */
  onError: httpHandlers.onError.bind(httpHandlers),
  /**
   * Process a request config through all registered request handlers.
   * For use by custom HttpClient implementations.
   */
  processRequest: httpHandlers.processRequest.bind(httpHandlers),
  /**
   * Process a response through all registered response handlers.
   * For use by custom HttpClient implementations.
   */
  processResponse: httpHandlers.processResponse.bind(httpHandlers),
  /**
   * Process an error through all registered error handlers.
   * For use by custom HttpClient implementations.
   */
  processError: httpHandlers.processError.bind(httpHandlers)
};

// src/interceptors.ts
var VisitInterceptors = class {
  requestHandlers = [];
  responseHandlers = [];
  onVisitRequest(handler) {
    this.requestHandlers.push(handler);
    return () => {
      this.requestHandlers = this.requestHandlers.filter((h) => h !== handler);
    };
  }
  onVisitResponse(handler) {
    this.responseHandlers.push(handler);
    return () => {
      this.responseHandlers = this.responseHandlers.filter((h) => h !== handler);
    };
  }
  async processRequest(visit, config2) {
    let result = config2;
    for (const handler of this.requestHandlers) {
      result = await handler(visit, result);
    }
    return result;
  }
  async processResponse(visit, response) {
    let result = response;
    for (const handler of this.responseHandlers) {
      result = await handler(visit, result);
    }
    return result;
  }
};
var interceptors = new VisitInterceptors();
function exposeInterceptors() {
  if (typeof window === "undefined") {
    return;
  }
  ;
  window.__inertia_interceptors__ = interceptors;
}

// src/requestParams.ts
var RequestParams = class _RequestParams {
  callbacks = [];
  params;
  constructor(params) {
    if (!params.prefetch) {
      this.params = params;
    } else {
      const wrappedCallbacks = {
        onBefore: this.wrapCallback(params, "onBefore"),
        onBeforeUpdate: this.wrapCallback(params, "onBeforeUpdate"),
        onStart: this.wrapCallback(params, "onStart"),
        onProgress: this.wrapCallback(params, "onProgress"),
        onFinish: this.wrapCallback(params, "onFinish"),
        onCancel: this.wrapCallback(params, "onCancel"),
        onSuccess: this.wrapCallback(params, "onSuccess"),
        onError: this.wrapCallback(params, "onError"),
        onHttpException: this.wrapCallback(params, "onHttpException"),
        onNetworkError: this.wrapCallback(params, "onNetworkError"),
        onFlash: this.wrapCallback(params, "onFlash"),
        onCancelToken: this.wrapCallback(params, "onCancelToken"),
        onPrefetched: this.wrapCallback(params, "onPrefetched"),
        onPrefetching: this.wrapCallback(params, "onPrefetching")
      };
      this.params = {
        ...params,
        ...wrappedCallbacks,
        onPrefetchResponse: params.onPrefetchResponse || (() => {
        }),
        onPrefetchError: params.onPrefetchError || (() => {
        })
      };
    }
  }
  static create(params) {
    return new _RequestParams(params);
  }
  data() {
    return this.params.method === "get" ? null : this.params.data;
  }
  queryParams() {
    return this.params.method === "get" ? this.params.data : {};
  }
  isPartial() {
    return this.params.only.length > 0 || this.params.except.length > 0 || this.params.reset.length > 0;
  }
  isPrefetch() {
    return this.params.prefetch === true;
  }
  isDeferredPropsRequest() {
    return this.params.deferredProps === true;
  }
  isPollRequest() {
    return this.params.poll === true;
  }
  onCancelToken(cb) {
    this.params.onCancelToken({
      cancel: cb
    });
  }
  markAsFinished() {
    this.params.completed = true;
    this.params.cancelled = false;
    this.params.interrupted = false;
  }
  markAsCancelled({ cancelled = true, interrupted = false }) {
    this.params.onCancel();
    this.params.completed = false;
    this.params.cancelled = cancelled;
    this.params.interrupted = interrupted;
  }
  wasCancelledAtAll() {
    return this.params.cancelled || this.params.interrupted;
  }
  onFinish() {
    this.params.onFinish(this.params);
  }
  onStart() {
    this.params.onStart(this.params);
  }
  onPrefetching() {
    this.params.onPrefetching(this.params);
  }
  onPrefetchResponse(response) {
    if (this.params.onPrefetchResponse) {
      this.params.onPrefetchResponse(response);
    }
  }
  onPrefetchError(error) {
    if (this.params.onPrefetchError) {
      this.params.onPrefetchError(error);
    }
  }
  all() {
    return this.params;
  }
  headers() {
    const headers = {
      ...this.params.headers
    };
    if (this.isPartial()) {
      headers["X-Inertia-Partial-Component"] = page.get().component;
    }
    const only = this.params.only.concat(this.params.reset);
    if (only.length > 0) {
      headers["X-Inertia-Partial-Data"] = only.join(",");
    }
    if (this.params.except.length > 0) {
      headers["X-Inertia-Partial-Except"] = this.params.except.join(",");
    }
    if (this.params.reset.length > 0) {
      headers["X-Inertia-Reset"] = this.params.reset.join(",");
    }
    if (this.params.errorBag && this.params.errorBag.length > 0) {
      headers["X-Inertia-Error-Bag"] = this.params.errorBag;
    }
    return headers;
  }
  setPreserveOptions(page2) {
    this.params.preserveScroll = _RequestParams.resolvePreserveOption(this.params.preserveScroll, page2);
    this.params.preserveState = _RequestParams.resolvePreserveOption(this.params.preserveState, page2);
  }
  runCallbacks() {
    this.callbacks.forEach(({ name, args }) => {
      this.params[name](...args);
    });
  }
  merge(toMerge) {
    this.params = {
      ...this.params,
      ...toMerge
    };
  }
  wrapCallback(params, name) {
    return (...args) => {
      this.recordCallback(name, args);
      params[name](...args);
    };
  }
  recordCallback(name, args) {
    this.callbacks.push({ name, args });
  }
  static resolvePreserveOption(value, page2) {
    if (typeof value === "function") {
      return value(page2);
    }
    if (value === "errors") {
      return Object.keys(page2.props.errors || {}).length > 0;
    }
    return value;
  }
};

// src/response.ts
import { isEqual as isEqual2 } from "es-toolkit";
import { get as get5, set as set4 } from "es-toolkit/compat";

// src/dialog.ts
var dialog_default = {
  createIframeAndPage(html) {
    if (typeof html === "object") {
      html = `All Inertia requests must receive a valid Inertia response, however a plain JSON response was received.<hr>${JSON.stringify(
        html
      )}`;
    }
    const page2 = document.createElement("html");
    page2.innerHTML = html;
    page2.querySelectorAll("a").forEach((a) => a.setAttribute("target", "_top"));
    const iframe = document.createElement("iframe");
    iframe.style.backgroundColor = "white";
    iframe.style.borderRadius = "5px";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.setAttribute("sandbox", "allow-scripts");
    return { iframe, page: page2 };
  },
  show(html) {
    const { iframe, page: page2 } = this.createIframeAndPage(html);
    iframe.style.boxSizing = "border-box";
    iframe.style.display = "block";
    const dialog = document.createElement("dialog");
    dialog.id = "inertia-error-dialog";
    Object.assign(dialog.style, {
      width: "calc(100vw - 100px)",
      height: "calc(100vh - 100px)",
      padding: "0",
      margin: "auto",
      border: "none",
      backgroundColor: "transparent"
    });
    const dialogStyleElement = document.createElement("style");
    dialogStyleElement.textContent = `
      dialog#inertia-error-dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.6);
      }

      dialog#inertia-error-dialog:focus {
        outline: none;
      }
    `;
    const nonce = config.get("nonce");
    if (nonce) {
      dialogStyleElement.nonce = nonce;
    }
    document.head.appendChild(dialogStyleElement);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
    dialog.addEventListener("close", () => {
      dialogStyleElement.remove();
      dialog.remove();
    });
    dialog.appendChild(iframe);
    document.body.prepend(dialog);
    dialog.showModal();
    dialog.focus();
    iframe.srcdoc = page2.outerHTML;
  }
};

// src/partialReload.ts
var isPathOrSubPath = (path, candidate) => {
  return path === candidate || path.startsWith(`${candidate}.`);
};
var partialReloadRequestsProp = (visit, prop) => {
  const { only, except } = visit;
  if (only.length === 0 && except.length === 0) {
    return false;
  }
  if (only.length > 0 && !only.some((candidate) => isPathOrSubPath(prop, candidate))) {
    return false;
  }
  if (except.length > 0 && except.some((candidate) => isPathOrSubPath(prop, candidate))) {
    return false;
  }
  return true;
};
var partialReloadRequestsSomeProps = (visit, props) => {
  return props.some((prop) => partialReloadRequestsProp(visit, prop));
};

// src/response.ts
var queue2 = new Queue();
var Response = class _Response {
  constructor(requestParams, response, originatingPage) {
    this.requestParams = requestParams;
    this.response = response;
    this.originatingPage = originatingPage;
  }
  requestParams;
  response;
  originatingPage;
  wasPrefetched = false;
  processed = false;
  static create(params, response, originatingPage) {
    return new _Response(params, response, originatingPage);
  }
  isProcessed() {
    return this.processed;
  }
  async handlePrefetch() {
    if (isSameUrlWithoutHash(this.requestParams.all().url, window.location)) {
      this.handle();
    }
  }
  async handle() {
    return queue2.add(() => this.process());
  }
  async process() {
    if (this.requestParams.all().prefetch) {
      this.wasPrefetched = true;
      this.requestParams.all().prefetch = false;
      this.requestParams.all().onPrefetched(this.response, this.requestParams.all());
      firePrefetchedEvent(this.response, this.requestParams.all());
      return Promise.resolve();
    }
    this.requestParams.runCallbacks();
    this.processed = true;
    if (!this.isInertiaResponse()) {
      return this.handleNonInertiaResponse();
    }
    if (this.isHttpException()) {
      const response = {
        ...this.response,
        data: this.getDataFromResponse(this.response.data)
      };
      if (this.requestParams.all().onHttpException(response) === false) {
        return;
      }
      if (!fireHttpExceptionEvent(response)) {
        return;
      }
    }
    await history.processQueue();
    history.preserveUrl = this.requestParams.all().preserveUrl;
    await this.setPage();
    const { flash } = page.get();
    if (Object.keys(flash).length > 0 && !this.requestParams.isDeferredPropsRequest()) {
      fireFlashEvent(flash);
      this.requestParams.all().onFlash(flash);
    }
    const errors = page.get().props.errors || {};
    if (Object.keys(errors).length > 0) {
      const scopedErrors = this.getScopedErrors(errors);
      fireErrorEvent(scopedErrors, { page: page.get(), visitId: this.requestParams.all().id });
      return this.requestParams.all().onError(scopedErrors);
    }
    router.flushByCacheTags(this.requestParams.all().invalidateCacheTags || []);
    if (!this.wasPrefetched) {
      router.flush(page.get().url);
    }
    fireSuccessEvent(page.get(), { visitId: this.requestParams.all().id });
    await this.requestParams.all().onSuccess(page.get());
    history.preserveUrl = false;
  }
  mergeParams(params) {
    this.requestParams.merge(params);
  }
  getPageResponse() {
    const data = this.getDataFromResponse(this.response.data);
    if (typeof data === "object") {
      return this.response.data = { ...data, flash: data.flash ?? {}, rescuedProps: data.rescuedProps ?? [] };
    }
    return this.response.data = data;
  }
  async handleNonInertiaResponse() {
    if (this.isInertiaRedirect()) {
      router.visit(this.getHeader("x-inertia-redirect"), {
        ...this.requestParams.all(),
        method: "get",
        data: {}
      });
      return;
    }
    if (this.isLocationVisit()) {
      const locationUrl = hrefToUrl(this.getHeader("x-inertia-location"));
      setHashIfSameUrl(this.requestParams.all().url, locationUrl);
      return this.locationVisit(locationUrl);
    }
    const response = {
      ...this.response,
      data: this.getDataFromResponse(this.response.data)
    };
    if (this.requestParams.all().onHttpException(response) === false) {
      return;
    }
    if (fireHttpExceptionEvent(response)) {
      return dialog_default.show(response.data);
    }
  }
  isInertiaResponse() {
    return this.hasHeader("x-inertia");
  }
  isHttpException() {
    return this.response.status >= 400;
  }
  hasStatus(status2) {
    return this.response.status === status2;
  }
  getHeader(header) {
    return this.response.headers[header];
  }
  hasHeader(header) {
    return this.getHeader(header) !== void 0;
  }
  isInertiaRedirect() {
    return this.hasStatus(409) && this.hasHeader("x-inertia-redirect");
  }
  isLocationVisit() {
    return this.hasStatus(409) && this.hasHeader("x-inertia-location");
  }
  /**
   * @link https://inertiajs.com/redirects#external-redirects
   */
  locationVisit(url) {
    try {
      if (typeof window === "undefined") {
        return;
      }
      const responseVersion = this.getHeader("x-inertia-version");
      const versionChange = !!responseVersion && responseVersion !== page.get().version;
      if (!fireLocationEvent(url, versionChange)) {
        return;
      }
      if (versionChange && this.requestParams.all().async) {
        return;
      }
      SessionStorage.set(SessionStorage.locationVisitKey, {
        preserveScroll: this.requestParams.all().preserveScroll === true
      });
      if (isSameUrlWithoutHash(window.location, url)) {
        window.location.reload();
      } else {
        window.location.href = url.href;
      }
    } catch (error) {
      return false;
    }
  }
  async setPage() {
    const pageResponse = this.getPageResponse();
    if (!this.shouldSetPage(pageResponse)) {
      return Promise.resolve();
    }
    this.response = await interceptors.processResponse(this.requestParams.all(), this.response);
    this.mergeProps(pageResponse);
    page.mergeOncePropsIntoResponse(pageResponse);
    this.preserveOptimisticProps(pageResponse);
    this.preserveEqualProps(pageResponse);
    await this.setRememberedState(pageResponse);
    this.requestParams.setPreserveOptions(pageResponse);
    pageResponse.url = history.preserveUrl ? page.get().url : this.pageUrl(pageResponse);
    this.requestParams.all().onBeforeUpdate(pageResponse);
    fireBeforeUpdateEvent(pageResponse);
    return page.set(pageResponse, {
      replace: this.requestParams.all().replace,
      preserveScroll: this.requestParams.all().preserveScroll,
      preserveState: this.requestParams.all().preserveState,
      viewTransition: this.requestParams.all().viewTransition,
      cached: this.requestParams.all().cached,
      visitId: this.requestParams.all().id
    });
  }
  getDataFromResponse(response) {
    if (typeof response !== "string") {
      return response;
    }
    try {
      return JSON.parse(response);
    } catch (error) {
      return response;
    }
  }
  shouldSetPage(pageResponse) {
    if (!this.requestParams.all().async) {
      return true;
    }
    if (this.originatingPage.component !== pageResponse.component) {
      return true;
    }
    if (this.originatingPage.component !== page.get().component) {
      return false;
    }
    const originatingUrl = hrefToUrl(this.originatingPage.url);
    const currentPageUrl = hrefToUrl(page.get().url);
    return originatingUrl.origin === currentPageUrl.origin && originatingUrl.pathname === currentPageUrl.pathname;
  }
  pageUrl(pageResponse) {
    const responseUrl = hrefToUrl(pageResponse.url);
    if (pageResponse.preserveFragment) {
      responseUrl.hash = this.requestParams.all().url.hash;
    } else {
      setHashIfSameUrl(this.requestParams.all().url, responseUrl);
    }
    return responseUrl.pathname + responseUrl.search + responseUrl.hash;
  }
  preserveOptimisticProps(pageResponse) {
    if (!router.hasPendingOptimistic()) {
      return;
    }
    for (const key of Object.keys(pageResponse.props)) {
      if (page.hasBaseline(key)) {
        page.updateBaseline(key, pageResponse.props[key]);
        pageResponse.props[key] = page.get().props[key];
      }
    }
  }
  preserveEqualProps(pageResponse) {
    if (pageResponse.component !== page.get().component) {
      return;
    }
    const currentPageProps = page.get().props;
    Object.entries(pageResponse.props).forEach(([key, value]) => {
      if (isEqual2(value, currentPageProps[key])) {
        pageResponse.props[key] = currentPageProps[key];
      }
    });
  }
  mergeProps(pageResponse) {
    if (!this.requestParams.isPartial() || pageResponse.component !== page.get().component) {
      return;
    }
    const propsToAppend = pageResponse.mergeProps || [];
    const propsToPrepend = pageResponse.prependProps || [];
    const propsToDeepMerge = pageResponse.deepMergeProps || [];
    const matchPropsOn = pageResponse.matchPropsOn || [];
    const mergeProp = (prop, shouldAppend) => {
      const currentProp = get5(page.get().props, prop);
      const incomingProp = get5(pageResponse.props, prop);
      if (Array.isArray(incomingProp)) {
        const newArray = this.mergeOrMatchItems(
          currentProp || [],
          incomingProp,
          prop,
          matchPropsOn,
          shouldAppend
        );
        set4(pageResponse.props, prop, newArray);
      } else if (typeof incomingProp === "object" && incomingProp !== null) {
        const newObject = {
          ...currentProp || {},
          ...incomingProp
        };
        set4(pageResponse.props, prop, newObject);
      }
    };
    propsToAppend.forEach((prop) => mergeProp(prop, true));
    propsToPrepend.forEach((prop) => mergeProp(prop, false));
    propsToDeepMerge.forEach((prop) => {
      const currentProp = get5(page.get().props, prop);
      const incomingProp = get5(pageResponse.props, prop);
      const deepMerge = (target, source, matchProp) => {
        if (Array.isArray(source)) {
          return this.mergeOrMatchItems(target, source, matchProp, matchPropsOn);
        }
        if (typeof source === "object" && source !== null) {
          return Object.keys(source).reduce(
            (acc, key) => {
              acc[key] = deepMerge(target ? target[key] : void 0, source[key], `${matchProp}.${key}`);
              return acc;
            },
            { ...target }
          );
        }
        return source;
      };
      set4(pageResponse.props, prop, deepMerge(currentProp, incomingProp, prop));
    });
    const nestedTopKeys = new Set(
      [...this.requestParams.all().only, ...this.requestParams.all().except].filter((prop) => prop.includes(".")).map((prop) => prop.split(".")[0])
    );
    for (const key of nestedTopKeys) {
      const currentValue = page.get().props[key];
      if (this.isObject(currentValue) && this.isObject(pageResponse.props[key])) {
        pageResponse.props[key] = this.deepMergeObjects(currentValue, pageResponse.props[key]);
      }
    }
    pageResponse.props = { ...page.get().props, ...pageResponse.props };
    if (this.shouldPreserveErrors(pageResponse)) {
      pageResponse.props.errors = page.get().props.errors;
    }
    if (page.get().scrollProps) {
      pageResponse.scrollProps = {
        ...page.get().scrollProps || {},
        ...pageResponse.scrollProps || {}
      };
    }
    if (page.hasOnceProps()) {
      pageResponse.onceProps = {
        ...page.get().onceProps || {},
        ...pageResponse.onceProps || {}
      };
    }
    if (this.requestParams.isDeferredPropsRequest()) {
      pageResponse.flash = { ...page.get().flash };
    }
    const currentOriginalDeferred = page.get().initialDeferredProps;
    if (currentOriginalDeferred && Object.keys(currentOriginalDeferred).length > 0) {
      pageResponse.initialDeferredProps = currentOriginalDeferred;
    }
    pageResponse.rescuedProps = this.mergeRescuedProps(pageResponse);
  }
  mergeRescuedProps(pageResponse) {
    const currentRescued = page.get().rescuedProps ?? [];
    const incomingRescued = pageResponse.rescuedProps ?? [];
    const newRescued = new Set(
      currentRescued.filter((prop) => !partialReloadRequestsProp(this.requestParams.all(), prop))
    );
    incomingRescued.forEach((prop) => newRescued.add(prop));
    return Array.from(newRescued);
  }
  /**
   * By default, the Laravel adapter shares validation errors via Inertia::always(),
   * so responses always include errors, even when empty. Components like
   * InfiniteScroll and WhenVisible, as well as loading deferred props,
   * perform async requests that should practically never reset errors.
   */
  shouldPreserveErrors(pageResponse) {
    if (!this.requestParams.all().preserveErrors) {
      return false;
    }
    const currentErrors = page.get().props.errors;
    if (!currentErrors || Object.keys(currentErrors).length === 0) {
      return false;
    }
    const responseErrors = pageResponse.props.errors;
    if (responseErrors && Object.keys(responseErrors).length > 0) {
      return false;
    }
    return true;
  }
  isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  }
  deepMergeObjects(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      const targetValue = target[key];
      const sourceValue = source[key];
      if (this.isObject(targetValue) && this.isObject(sourceValue)) {
        result[key] = this.deepMergeObjects(targetValue, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
    return result;
  }
  mergeOrMatchItems(existingItems, newItems, matchProp, matchPropsOn, shouldAppend = true) {
    const items = Array.isArray(existingItems) ? existingItems : [];
    const matchingKey = matchPropsOn.find((key) => {
      const keyPath = key.split(".").slice(0, -1).join(".");
      return keyPath === matchProp;
    });
    if (!matchingKey) {
      return shouldAppend ? [...items, ...newItems] : [...newItems, ...items];
    }
    const uniqueProperty = matchingKey.split(".").pop() || "";
    const newItemsMap = /* @__PURE__ */ new Map();
    newItems.forEach((item) => {
      if (this.hasUniqueProperty(item, uniqueProperty)) {
        newItemsMap.set(item[uniqueProperty], item);
      }
    });
    return shouldAppend ? this.appendWithMatching(items, newItems, newItemsMap, uniqueProperty) : this.prependWithMatching(items, newItems, newItemsMap, uniqueProperty);
  }
  appendWithMatching(existingItems, newItems, newItemsMap, uniqueProperty) {
    const updatedExisting = existingItems.map((item) => {
      if (this.hasUniqueProperty(item, uniqueProperty) && newItemsMap.has(item[uniqueProperty])) {
        return newItemsMap.get(item[uniqueProperty]);
      }
      return item;
    });
    const newItemsToAdd = newItems.filter((item) => {
      if (!this.hasUniqueProperty(item, uniqueProperty)) {
        return true;
      }
      return !existingItems.some(
        (existing) => this.hasUniqueProperty(existing, uniqueProperty) && existing[uniqueProperty] === item[uniqueProperty]
      );
    });
    return [...updatedExisting, ...newItemsToAdd];
  }
  prependWithMatching(existingItems, newItems, newItemsMap, uniqueProperty) {
    const untouchedExisting = existingItems.filter((item) => {
      if (this.hasUniqueProperty(item, uniqueProperty)) {
        return !newItemsMap.has(item[uniqueProperty]);
      }
      return true;
    });
    return [...newItems, ...untouchedExisting];
  }
  hasUniqueProperty(item, property) {
    return item && typeof item === "object" && property in item;
  }
  async setRememberedState(pageResponse) {
    const rememberedState = await history.getState(history.rememberedState, {});
    if (this.requestParams.all().preserveState && rememberedState && pageResponse.component === page.get().component) {
      pageResponse.rememberedState = rememberedState;
    }
  }
  getScopedErrors(errors) {
    if (!this.requestParams.all().errorBag) {
      return errors;
    }
    return errors[this.requestParams.all().errorBag || ""] || {};
  }
};

// src/request.ts
var Request = class _Request {
  constructor(params, page2, { optimistic = false } = {}) {
    this.page = page2;
    this.requestParams = RequestParams.create(params);
    this.cancelToken = new AbortController();
    this.optimistic = optimistic;
  }
  page;
  response;
  cancelToken;
  requestParams;
  requestHasFinished = false;
  optimistic;
  static create(params, page2, options) {
    return new _Request(params, page2, options);
  }
  isPrefetch() {
    return this.requestParams.isPrefetch();
  }
  getUrl() {
    return this.requestParams.all().url;
  }
  isOptimistic() {
    return this.optimistic;
  }
  isPendingOptimistic() {
    return this.isOptimistic() && (!this.response || !this.response.isProcessed());
  }
  async send() {
    this.requestParams.onCancelToken(() => {
      if (this.response) {
        return;
      }
      this.cancel({ cancelled: true });
    });
    fireStartEvent(this.requestParams.all());
    this.requestParams.onStart();
    if (this.requestParams.all().prefetch) {
      this.requestParams.onPrefetching();
      firePrefetchingEvent(this.requestParams.all());
    }
    const originallyPrefetch = this.requestParams.all().prefetch;
    const config2 = {
      method: this.requestParams.all().method,
      url: urlWithoutHash(this.requestParams.all().url).href,
      data: this.requestParams.data(),
      signal: this.cancelToken.signal,
      headers: this.getHeaders(),
      onUploadProgress: this.onProgress.bind(this)
    };
    const processedConfig = await interceptors.processRequest(this.requestParams.all(), config2);
    return http.getClient().request(processedConfig).then((response) => {
      this.response = Response.create(this.requestParams, response, this.page);
      return this.response.handle();
    }).catch((error) => {
      if (error instanceof HttpResponseError) {
        this.response = Response.create(this.requestParams, error.response, this.page);
        return this.response.handle();
      }
      return Promise.reject(error);
    }).catch((error) => {
      if (error instanceof HttpCancelledError) {
        return;
      }
      if (this.requestParams.all().onNetworkError(error) === false) {
        return;
      }
      if (fireNetworkErrorEvent(error)) {
        if (originallyPrefetch) {
          this.requestParams.onPrefetchError(error);
        }
        return Promise.reject(error);
      }
    }).finally(() => {
      this.finish();
      if (originallyPrefetch && this.response) {
        this.requestParams.onPrefetchResponse(this.response);
      }
    });
  }
  finish() {
    if (this.requestParams.wasCancelledAtAll()) {
      return;
    }
    this.requestParams.markAsFinished();
    this.fireFinishEvents();
  }
  fireFinishEvents() {
    if (this.requestHasFinished) {
      return;
    }
    this.requestHasFinished = true;
    fireFinishEvent(this.requestParams.all());
    this.requestParams.onFinish();
  }
  cancel({ cancelled = false, interrupted = false }) {
    if (this.requestHasFinished) {
      return;
    }
    this.cancelToken.abort();
    this.requestParams.markAsCancelled({ cancelled, interrupted });
    this.fireFinishEvents();
  }
  onProgress(progress3) {
    if (this.requestParams.data() instanceof FormData) {
      fireProgressEvent(progress3);
      this.requestParams.all().onProgress(progress3);
    }
  }
  getHeaders() {
    const headers = {
      ...this.requestParams.headers(),
      Accept: "text/html, application/xhtml+xml",
      "X-Requested-With": "XMLHttpRequest",
      "X-Inertia": true
    };
    const page2 = page.get();
    if (page2.version) {
      headers["X-Inertia-Version"] = page2.version;
    }
    const onceProps = Object.entries(page2.onceProps || {}).filter(([, onceProp]) => {
      if (get6(page2.props, onceProp.prop) === void 0) {
        return false;
      }
      return !onceProp.expiresAt || onceProp.expiresAt > Date.now();
    }).map(([key]) => key);
    if (onceProps.length > 0) {
      headers["X-Inertia-Except-Once-Props"] = onceProps.join(",");
    }
    return headers;
  }
};

// src/requestStream.ts
var RequestStream = class {
  requests = [];
  maxConcurrent;
  interruptible;
  constructor({ maxConcurrent, interruptible }) {
    this.maxConcurrent = maxConcurrent;
    this.interruptible = interruptible;
  }
  send(request) {
    this.requests.push(request);
    request.send().finally(() => {
      this.requests = this.requests.filter((r) => r !== request);
    });
  }
  interruptInFlight() {
    this.cancel({ interrupted: true }, false);
  }
  cancelInFlight(options = {}) {
    const shouldCancel = typeof options === "function" ? options : (request) => {
      const { prefetch = true, optimistic = true } = options;
      return (prefetch || !request.isPrefetch()) && (optimistic || !request.isOptimistic());
    };
    this.requests.filter(shouldCancel).forEach((request) => request.cancel({ cancelled: true }));
  }
  cancel({ cancelled = false, interrupted = false } = {}, force = false) {
    if (!force && !this.shouldCancel()) {
      return;
    }
    const request = this.requests.shift();
    request?.cancel({ cancelled, interrupted });
  }
  shouldCancel() {
    return this.interruptible && this.requests.length >= this.maxConcurrent;
  }
  hasPendingOptimistic() {
    return this.requests.some((request) => request.isPendingOptimistic());
  }
};

// src/router.ts
var noop = () => {
};
var Router = class {
  syncRequestStream = new RequestStream({
    maxConcurrent: 1,
    interruptible: true
  });
  asyncRequestStream = new RequestStream({
    maxConcurrent: Infinity,
    interruptible: false
  });
  clientVisitQueue = new Queue();
  pendingOptimisticCallback = void 0;
  init({
    initialPage,
    resolveComponent,
    swapComponent,
    onFlash
  }) {
    page.init({
      initialPage,
      resolveComponent,
      swapComponent,
      onFlash
    });
    InitialVisit.handle();
    eventHandler.init();
    eventHandler.on("missingHistoryItem", () => {
      if (typeof window !== "undefined") {
        this.visit(window.location.href, { preserveState: true, preserveScroll: true, replace: true });
      }
    });
    eventHandler.on("loadDeferredProps", (deferredProps) => {
      this.loadDeferredProps(deferredProps);
    });
    eventHandler.on("historyQuotaExceeded", (url) => {
      window.location.href = url;
    });
  }
  optimistic(callback) {
    this.pendingOptimisticCallback = callback;
    return this;
  }
  get(url, data = {}, options = {}) {
    return this.visit(url, { ...options, method: "get", data });
  }
  post(url, data = {}, options = {}) {
    return this.visit(url, { preserveState: true, ...options, method: "post", data });
  }
  put(url, data = {}, options = {}) {
    return this.visit(url, { preserveState: true, ...options, method: "put", data });
  }
  patch(url, data = {}, options = {}) {
    return this.visit(url, { preserveState: true, ...options, method: "patch", data });
  }
  delete(url, options = {}) {
    return this.visit(url, { preserveState: true, ...options, method: "delete" });
  }
  reload(options = {}) {
    return this.doReload(options);
  }
  doReload(options = {}) {
    if (typeof window === "undefined") {
      return;
    }
    return this.visit(window.location.href, {
      ...options,
      preserveScroll: true,
      preserveState: true,
      async: true,
      headers: {
        ...options.headers || {},
        "Cache-Control": "no-cache"
      }
    });
  }
  remember(data, key = "default") {
    history.remember(data, key);
  }
  restore(key = "default") {
    return history.restore(key);
  }
  on(type, callback) {
    if (typeof window === "undefined") {
      return () => {
      };
    }
    return eventHandler.onGlobalEvent(type, callback);
  }
  once(type, callback) {
    if (typeof window === "undefined") {
      return () => {
      };
    }
    const remove2 = this.on(type, (event) => {
      remove2();
      return callback(event);
    });
    return remove2;
  }
  hasPendingOptimistic() {
    return this.asyncRequestStream.hasPendingOptimistic();
  }
  get activePolls() {
    return polls.count;
  }
  cancelAll({ async = true, prefetch = true, sync = true } = {}) {
    if (async) {
      this.asyncRequestStream.cancelInFlight({ prefetch });
    }
    if (sync) {
      this.syncRequestStream.cancelInFlight();
    }
  }
  poll(interval, requestOptions = {}, options = {}) {
    return polls.add(
      interval,
      ({ onStart, onFinish }) => {
        const resolved = typeof requestOptions === "function" ? requestOptions() : requestOptions;
        this.doReload({
          poll: true,
          preserveErrors: true,
          ...resolved,
          onCancelToken: (token) => {
            onStart(token.cancel);
            resolved.onCancelToken?.(token);
          },
          onFinish: (visit) => {
            onFinish();
            resolved.onFinish?.(visit);
          }
        });
      },
      {
        autoStart: options.autoStart ?? true,
        keepAlive: options.keepAlive ?? false,
        mode: options.mode
      }
    );
  }
  visit(href, options = {}) {
    options.optimistic = options.optimistic ?? this.pendingOptimisticCallback;
    this.pendingOptimisticCallback = void 0;
    if (options.optimistic) {
      options.async = options.async ?? true;
    }
    const visit = this.getPendingVisit(href, {
      ...options,
      showProgress: options.showProgress ?? (!options.async || !!options.optimistic)
    });
    const events = this.getVisitEvents(options);
    if (events.onBefore(visit) === false || !fireBeforeEvent(visit)) {
      return;
    }
    const currentPageUrl = hrefToUrl(page.get().url);
    const isPartialReload = visit.only.length > 0 || visit.except.length > 0 || visit.reset.length > 0;
    const isSamePage = isPartialReload ? isSameUrlWithoutQueryOrHash(visit.url, currentPageUrl) : isSameUrlWithoutHash(visit.url, currentPageUrl);
    if (!isSamePage) {
      this.asyncRequestStream.cancelInFlight(
        (request) => !request.isPrefetch() && !request.isOptimistic() && isSameUrlWithoutQueryOrHash(request.getUrl(), currentPageUrl)
      );
    }
    if (!visit.async) {
      this.syncRequestStream.interruptInFlight();
    }
    if (options.optimistic) {
      this.applyOptimisticUpdate(options.optimistic, events);
    }
    if (!page.isCleared() && !visit.preserveUrl) {
      Scroll.save();
    }
    const requestParams = {
      ...visit,
      ...events
    };
    const sendRequest = () => {
      const prefetched = prefetchedRequests.get(requestParams);
      if (prefetched) {
        progress.reveal(prefetched.inFlight);
        prefetchedRequests.use(prefetched, requestParams);
      } else {
        progress.reveal(true);
        const requestStream = visit.async ? this.asyncRequestStream : this.syncRequestStream;
        requestStream.send(Request.create(requestParams, page.get(), { optimistic: !!options.optimistic }));
      }
    };
    if (Array.isArray(visit.component)) {
      console.error(
        `The "component" prop received an array of components (${visit.component.join(", ")}), but only a single component string is supported for instant visits. Pass an explicit component name instead.`
      );
      visit.component = null;
    }
    if (visit.component) {
      history.processQueue().then(() => {
        this.performInstantSwap(visit).then(() => {
          requestParams.preserveScroll = true;
          requestParams.preserveState = true;
          requestParams.replace = true;
          requestParams.viewTransition = false;
          sendRequest();
        });
      });
    } else {
      sendRequest();
    }
  }
  getCached(href, options = {}) {
    return prefetchedRequests.findCached(this.getPrefetchParams(href, options));
  }
  flush(href, options = {}) {
    prefetchedRequests.remove(this.getPrefetchParams(href, options));
  }
  flushAll() {
    prefetchedRequests.removeAll();
  }
  flushByCacheTags(tags) {
    prefetchedRequests.removeByTags(Array.isArray(tags) ? tags : [tags]);
  }
  getPrefetching(href, options = {}) {
    return prefetchedRequests.findInFlight(this.getPrefetchParams(href, options));
  }
  prefetch(href, options = {}, prefetchOptions = {}) {
    const method = options.method ?? (isUrlMethodPair(href) ? href.method : "get");
    if (method !== "get") {
      throw new Error("Prefetch requests must use the GET method");
    }
    const visit = this.getPendingVisit(href, {
      ...options,
      async: true,
      showProgress: false,
      prefetch: true,
      viewTransition: false
    });
    const visitUrl = visit.url.origin + visit.url.pathname + visit.url.search;
    const currentUrl = window.location.origin + window.location.pathname + window.location.search;
    if (visitUrl === currentUrl) {
      return;
    }
    const events = this.getVisitEvents(options);
    if (events.onBefore(visit) === false || !fireBeforeEvent(visit)) {
      return;
    }
    progress.hide();
    this.asyncRequestStream.interruptInFlight();
    const requestParams = {
      ...visit,
      ...events
    };
    const ensureCurrentPageIsSet = () => {
      return new Promise((resolve) => {
        const checkIfPageIsDefined = () => {
          if (page.get()) {
            resolve();
          } else {
            setTimeout(checkIfPageIsDefined, 50);
          }
        };
        checkIfPageIsDefined();
      });
    };
    ensureCurrentPageIsSet().then(() => {
      prefetchedRequests.add(
        requestParams,
        (params) => {
          this.asyncRequestStream.send(Request.create(params, page.get()));
        },
        {
          cacheFor: config.get("prefetch.cacheFor"),
          cacheTags: [],
          ...prefetchOptions
        }
      );
    });
  }
  clearHistory() {
    history.clear();
  }
  decryptHistory() {
    return history.decrypt();
  }
  resolveComponent(component, page2) {
    return page.resolve(component, page2);
  }
  replace(params) {
    this.clientVisit(params, { replace: true });
  }
  replaceProp(name, value, options) {
    this.replace({
      preserveScroll: true,
      preserveState: true,
      props(currentProps) {
        const newValue = typeof value === "function" ? value(get7(currentProps, name), currentProps) : value;
        return setPathPreservingIdentity(currentProps, name, newValue);
      },
      ...options || {}
    });
  }
  appendToProp(name, value, options) {
    this.replaceProp(
      name,
      (currentValue, currentProps) => {
        const newValue = typeof value === "function" ? value(currentValue, currentProps) : value;
        if (!Array.isArray(currentValue)) {
          currentValue = currentValue !== void 0 ? [currentValue] : [];
        }
        return [...currentValue, newValue];
      },
      options
    );
  }
  prependToProp(name, value, options) {
    this.replaceProp(
      name,
      (currentValue, currentProps) => {
        const newValue = typeof value === "function" ? value(currentValue, currentProps) : value;
        if (!Array.isArray(currentValue)) {
          currentValue = currentValue !== void 0 ? [currentValue] : [];
        }
        return [newValue, ...currentValue];
      },
      options
    );
  }
  push(params) {
    this.clientVisit(params);
  }
  flash(keyOrData, value) {
    const current = page.get().flash;
    let flash;
    if (typeof keyOrData === "function") {
      flash = keyOrData(current);
    } else if (typeof keyOrData === "string") {
      flash = { ...current, [keyOrData]: value };
    } else if (keyOrData && Object.keys(keyOrData).length) {
      flash = { ...current, ...keyOrData };
    } else {
      return;
    }
    page.setFlash(flash);
    if (Object.keys(flash).length) {
      fireFlashEvent(flash);
    }
  }
  clientVisit(params, { replace = false } = {}) {
    this.clientVisitQueue.add(() => this.performClientVisit(params, { replace }));
  }
  performClientVisit(params, { replace = false } = {}) {
    const current = page.get();
    const onceProps = typeof params.props === "function" ? Object.fromEntries(
      Object.values(current.onceProps ?? {}).map((onceProp) => [
        onceProp.prop,
        get7(current.props, onceProp.prop)
      ])
    ) : {};
    const props = typeof params.props === "function" ? params.props(current.props, onceProps) : params.props ?? current.props;
    const flash = typeof params.flash === "function" ? params.flash(current.flash) : params.flash;
    const { viewTransition, onError, onFinish, onFlash, onSuccess, ...pageParams } = params;
    const page2 = {
      ...current,
      ...pageParams,
      flash: flash ?? {},
      props
    };
    const preserveScroll = RequestParams.resolvePreserveOption(params.preserveScroll ?? false, page2);
    const preserveState = RequestParams.resolvePreserveOption(params.preserveState ?? false, page2);
    const visitId = this.createVisitId();
    return page.set(page2, {
      replace,
      preserveScroll,
      preserveState,
      viewTransition,
      visitId
    }).then(() => {
      fireClientVisitEvent(page.get(), { replace, visitId });
      const currentFlash = page.get().flash;
      if (Object.keys(currentFlash).length > 0) {
        fireFlashEvent(currentFlash);
        onFlash?.(currentFlash);
      }
      const errors = page.get().props.errors || {};
      if (Object.keys(errors).length === 0) {
        onSuccess?.(page.get());
        return;
      }
      const scopedErrors = params.errorBag ? errors[params.errorBag || ""] || {} : errors;
      onError?.(scopedErrors);
    }).finally(() => onFinish?.(params));
  }
  performInstantSwap(visit) {
    const current = page.get();
    const sharedProps = Object.fromEntries(
      (current.sharedProps ?? []).filter((key) => key in current.props).map((key) => [key, current.props[key]])
    );
    const resolvedPageProps = typeof visit.pageProps === "function" ? visit.pageProps(cloneDeep4(current.props), cloneDeep4(sharedProps)) : visit.pageProps;
    const intermediateProps = resolvedPageProps !== null ? { ...resolvedPageProps } : { ...sharedProps };
    const onceProps = this.preserveOncePropsOnInstantVisit(current, intermediateProps);
    const intermediatePage = {
      component: visit.component,
      url: visit.url.pathname + visit.url.search + visit.url.hash,
      version: current.version,
      props: {
        ...intermediateProps,
        errors: {}
      },
      flash: {},
      rescuedProps: [],
      clearHistory: false,
      encryptHistory: current.encryptHistory,
      sharedProps: current.sharedProps,
      onceProps,
      rememberedState: {}
    };
    return page.set(intermediatePage, {
      replace: visit.replace,
      preserveScroll: RequestParams.resolvePreserveOption(visit.preserveScroll, intermediatePage),
      preserveState: false,
      viewTransition: visit.viewTransition,
      visitId: visit.id
    });
  }
  /**
   * Once props are remembered client-side, so the placeholder page must preserve their values
   * and registry. Otherwise the swap discards the value, and an in-flight prefetch that already
   * claimed the prop resolves with nothing to restore it from.
   */
  preserveOncePropsOnInstantVisit(current, props) {
    const onceProps = {};
    Object.entries(current.onceProps ?? {}).forEach(([key, onceProp]) => {
      if (get7(props, onceProp.prop) !== void 0) {
        return;
      }
      const currentValue = get7(current.props, onceProp.prop);
      if (currentValue === void 0) {
        return;
      }
      set5(props, onceProp.prop, currentValue);
      onceProps[key] = onceProp;
    });
    return onceProps;
  }
  getPrefetchParams(href, options) {
    return {
      ...this.getPendingVisit(href, {
        ...options,
        async: true,
        showProgress: false,
        prefetch: true,
        viewTransition: false
      }),
      ...this.getVisitEvents(options)
    };
  }
  createVisitId() {
    return uid();
  }
  getPendingVisit(href, options) {
    if (isUrlMethodPair(href)) {
      const urlMethodPair = href;
      href = urlMethodPair.url;
      options.method = options.method ?? urlMethodPair.method;
    }
    const defaultVisitOptionsCallback = config.get("visitOptions");
    const configuredOptions = defaultVisitOptionsCallback ? defaultVisitOptionsCallback(href.toString(), cloneDeep4(options)) || {} : {};
    const mergedOptions = {
      method: "get",
      data: {},
      replace: false,
      preserveScroll: false,
      preserveState: false,
      only: [],
      except: [],
      headers: {},
      errorBag: "",
      forceFormData: false,
      queryStringArrayFormat: "brackets",
      async: false,
      showProgress: true,
      fresh: false,
      reset: [],
      preserveUrl: false,
      preserveErrors: false,
      prefetch: false,
      invalidateCacheTags: [],
      viewTransition: false,
      component: null,
      pageProps: null,
      cached: false,
      ...stripTopLevelUndefined(options),
      ...stripTopLevelUndefined(configuredOptions)
    };
    const [url, _data] = transformUrlAndData(
      href,
      mergedOptions.data,
      mergedOptions.method,
      mergedOptions.forceFormData,
      mergedOptions.queryStringArrayFormat
    );
    const visit = {
      id: this.createVisitId(),
      cancelled: false,
      completed: false,
      interrupted: false,
      ...mergedOptions,
      url,
      data: _data
    };
    if (visit.prefetch) {
      visit.headers["Purpose"] = "prefetch";
    }
    return visit;
  }
  getVisitEvents(options) {
    return {
      onCancelToken: options.onCancelToken || noop,
      onBefore: options.onBefore || noop,
      onBeforeUpdate: options.onBeforeUpdate || noop,
      onStart: options.onStart || noop,
      onProgress: options.onProgress || noop,
      onFinish: options.onFinish || noop,
      onCancel: options.onCancel || noop,
      onSuccess: options.onSuccess || noop,
      onError: options.onError || noop,
      onHttpException: options.onHttpException || noop,
      onNetworkError: options.onNetworkError || noop,
      onFlash: options.onFlash || noop,
      onPrefetched: options.onPrefetched || noop,
      onPrefetching: options.onPrefetching || noop
    };
  }
  applyOptimisticUpdate(optimistic, events) {
    const currentProps = page.get().props;
    const optimisticProps = optimistic(cloneDeep4(currentProps));
    if (!optimisticProps) {
      return;
    }
    const changedKeys = [];
    for (const key of Object.keys(optimisticProps)) {
      if (!isEqual3(currentProps[key], optimisticProps[key])) {
        changedKeys.push(key);
      }
    }
    if (changedKeys.length === 0) {
      return;
    }
    const id = page.nextOptimisticId();
    const component = page.get().component;
    for (const key of changedKeys) {
      page.setBaseline(key, cloneDeep4(currentProps[key]));
    }
    page.registerOptimistic(id, optimistic);
    page.setPropsQuietly({ ...currentProps, ...optimisticProps });
    let shouldRestore = true;
    const originalOnSuccess = events.onSuccess;
    events.onSuccess = (page2) => {
      shouldRestore = false;
      return originalOnSuccess(page2);
    };
    const originalOnFinish = events.onFinish;
    events.onFinish = (visit) => {
      page.unregisterOptimistic(id);
      if (shouldRestore && page.get().component === component) {
        const replayedProps = page.replayOptimistics();
        if (Object.keys(replayedProps).length > 0) {
          page.setPropsQuietly({ ...page.get().props, ...replayedProps });
        }
      }
      if (page.pendingOptimisticCount() === 0) {
        page.clearOptimisticState();
      }
      return originalOnFinish(visit);
    };
  }
  loadDeferredProps(deferred) {
    if (deferred) {
      Object.values(deferred).forEach((props) => {
        this.doReload({ only: props, deferredProps: true, preserveErrors: true });
      });
    }
  }
};

// src/useFormUtils.ts
var UseFormUtils = class {
  /**
   * Creates a callback that returns a UrlMethodPair.
   *
   * createWayfinderCallback(urlMethodPair)
   * createWayfinderCallback(method, url)
   * createWayfinderCallback(() => urlMethodPair)
   * createWayfinderCallback(() => method, () => url)
   */
  static createWayfinderCallback(...args) {
    return () => {
      if (args.length === 1) {
        return isUrlMethodPair(args[0]) ? args[0] : args[0]();
      }
      return {
        method: typeof args[0] === "function" ? args[0]() : args[0],
        url: typeof args[1] === "function" ? args[1]() : args[1]
      };
    };
  }
  /**
   * Parses all useForm() arguments into { rememberKey, data, precognitionEndpoint }.
   *
   * useForm()
   * useForm(data)
   * useForm(rememberKey, data)
   * useForm(method, url, data)
   * useForm(urlMethodPair, data)
   *
   */
  static parseUseFormArguments(...args) {
    if (args.length === 0) {
      return {
        rememberKey: null,
        data: {},
        precognitionEndpoint: null
      };
    }
    if (args.length === 1) {
      return {
        rememberKey: null,
        data: args[0],
        precognitionEndpoint: null
      };
    }
    if (args.length === 2) {
      if (typeof args[0] === "string") {
        return {
          rememberKey: args[0],
          data: args[1],
          precognitionEndpoint: null
        };
      }
      return {
        rememberKey: null,
        data: args[1],
        precognitionEndpoint: this.createWayfinderCallback(args[0])
      };
    }
    return {
      rememberKey: null,
      data: args[2],
      precognitionEndpoint: this.createWayfinderCallback(args[0], args[1])
    };
  }
  /**
   * Parses all submission arguments into { method, url, options }.
   * It uses the Precognition endpoint if no explicit method/url are provided.
   *
   * form.submit(method, url)
   * form.submit(method, url, options)
   * form.submit(urlMethodPair)
   * form.submit(urlMethodPair, options)
   * form.submit()
   * form.submit(options)
   */
  static parseSubmitArguments(args, precognitionEndpoint) {
    if (args.length === 3 || args.length === 2 && typeof args[0] === "string") {
      return { method: args[0], url: args[1], options: args[2] ?? {} };
    }
    if (isUrlMethodPair(args[0])) {
      return { ...args[0], options: args[1] ?? {} };
    }
    return { ...precognitionEndpoint(), options: args[0] ?? {} };
  }
  /**
   * Merges headers into the Precognition validate() arguments.
   */
  static mergeHeadersForValidation(field, config2, headers) {
    const merge = (config3) => {
      config3.headers = {
        ...headers ?? {},
        ...config3.headers ?? {}
      };
      return config3;
    };
    if (field && typeof field === "object" && !("target" in field)) {
      field = merge(field);
    } else if (config2 && typeof config2 === "object") {
      config2 = merge(config2);
    } else if (typeof field === "string") {
      config2 = merge(config2 ?? {});
    } else {
      field = merge(field ?? {});
    }
    return [field, config2];
  }
};

// src/axiosHttpClient.ts
function normalizeHeaders(headers) {
  if (!headers || typeof headers !== "object") {
    return {};
  }
  const normalized = {};
  const entries = typeof headers.entries === "function" ? Array.from(headers.entries()) : Object.entries(headers);
  for (const [key, value] of entries) {
    if (typeof value === "string") {
      normalized[key.toLowerCase()] = value;
    } else if (Array.isArray(value)) {
      normalized[key.toLowerCase()] = value.join(", ");
    }
  }
  return normalized;
}
function isBinaryRequestBody(value) {
  return typeof Blob !== "undefined" && value instanceof Blob || typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer || typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(value);
}
function hasContentTypeHeader(headers) {
  return Object.keys(headers ?? {}).some((key) => key.toLowerCase() === "content-type");
}
function toHttpProgressEvent(axiosEvent) {
  return {
    progress: axiosEvent.progress,
    percentage: axiosEvent.progress ? Math.round(axiosEvent.progress * 100) : 0,
    loaded: axiosEvent.loaded,
    total: axiosEvent.total
  };
}
var axiosModulePromise;
function loadAxiosModule() {
  if (!axiosModulePromise) {
    axiosModulePromise = import("axios").catch((error) => {
      axiosModulePromise = void 0;
      throw error;
    });
  }
  return axiosModulePromise;
}
var AxiosHttpClient = class {
  axiosInstance;
  constructor(instance) {
    this.axiosInstance = instance ? Promise.resolve(instance) : loadAxiosModule().then((module) => module.default);
  }
  async getAxios() {
    return this.axiosInstance;
  }
  async request(config2) {
    const processedConfig = await httpHandlers.processRequest(config2);
    try {
      const response = await this.doRequest(processedConfig);
      return await httpHandlers.processResponse(response);
    } catch (error) {
      if (error instanceof HttpResponseError || error instanceof HttpNetworkError || error instanceof HttpCancelledError) {
        await httpHandlers.processError(error);
      }
      throw error;
    }
  }
  async doRequest(config2) {
    const axios = await this.getAxios();
    const headers = { ...config2.headers ?? {} };
    if (isBinaryRequestBody(config2.data) && !hasContentTypeHeader(config2.headers)) {
      headers["Content-Type"] = false;
    }
    try {
      const response = await axios({
        method: config2.method,
        url: config2.url,
        data: config2.data,
        params: config2.params,
        headers,
        signal: config2.signal,
        responseType: "text",
        onUploadProgress: config2.onUploadProgress ? (event) => config2.onUploadProgress(toHttpProgressEvent(event)) : void 0
      });
      return {
        status: response.status,
        data: response.data,
        headers: normalizeHeaders(response.headers)
      };
    } catch (error) {
      const axiosModule = await loadAxiosModule();
      if (axiosModule.default.isCancel(error)) {
        throw new HttpCancelledError("Request was cancelled", config2.url);
      }
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error;
        const httpResponse = {
          status: axiosError.response.status,
          data: axiosError.response.data,
          headers: normalizeHeaders(axiosError.response.headers)
        };
        throw new HttpResponseError(
          `Request failed with status ${axiosError.response.status}`,
          httpResponse,
          config2.url
        );
      }
      throw new HttpNetworkError(
        error instanceof Error ? error.message : "Network error",
        config2.url,
        error instanceof Error ? error : void 0
      );
    }
  }
};
function axiosAdapter(instance) {
  return new AxiosHttpClient(instance);
}

// src/formObject.ts
import { get as get8, set as set6 } from "es-toolkit/compat";
function undotKey(key) {
  if (!key.includes(".")) {
    return key;
  }
  const transformSegment = (segment) => {
    if (segment.startsWith("[") && segment.endsWith("]")) {
      return segment;
    }
    return segment.split(".").reduce((result, part, index) => index === 0 ? part : `${result}[${part}]`);
  };
  return key.replace(/\\\./g, "__ESCAPED_DOT__").split(/(\[[^\]]*\])/).filter(Boolean).map(transformSegment).join("").replace(/__ESCAPED_DOT__/g, ".");
}
function parseKey2(key) {
  const path = [];
  const pattern = /([^\[\]]+)|\[(\d*)\]/g;
  let match;
  while ((match = pattern.exec(key)) !== null) {
    if (match[1] !== void 0) {
      path.push(match[1]);
    } else if (match[2] !== void 0) {
      path.push(match[2] === "" ? "" : Number(match[2]));
    }
  }
  return path;
}
function setNestedObject(obj, path, value) {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (!(path[i] in current)) {
      current[path[i]] = {};
    }
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
}
function objectHasSequentialNumericKeys(value) {
  const keys = Object.keys(value);
  const numericKeys = keys.filter((k) => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
  return keys.length === numericKeys.length && numericKeys.length > 0 && numericKeys[0] === 0 && numericKeys.every((n, i) => n === i);
}
function convertSequentialObjectsToArrays(value) {
  if (Array.isArray(value)) {
    return value.map(convertSequentialObjectsToArrays);
  }
  if (typeof value !== "object" || value === null || isFile(value)) {
    return value;
  }
  if (objectHasSequentialNumericKeys(value)) {
    const result2 = [];
    for (let i = 0; i < Object.keys(value).length; i++) {
      result2[i] = convertSequentialObjectsToArrays(value[i]);
    }
    return result2;
  }
  const result = {};
  for (const key in value) {
    result[key] = convertSequentialObjectsToArrays(value[key]);
  }
  return result;
}
function formDataToObject(source) {
  const form = {};
  for (const [key, value] of source.entries()) {
    if (value instanceof File && value.size === 0 && value.name === "") {
      continue;
    }
    const path = parseKey2(undotKey(key));
    if (path[path.length - 1] === "") {
      const arrayPath = path.slice(0, -1);
      const existing = get8(form, arrayPath);
      if (Array.isArray(existing)) {
        existing.push(value);
      } else if (existing && typeof existing === "object" && !isFile(existing)) {
        const numericKeys = Object.keys(existing).filter((k) => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
        set6(form, arrayPath, numericKeys.length > 0 ? [...numericKeys.map((k) => existing[k]), value] : [value]);
      } else {
        set6(form, arrayPath, [value]);
      }
      continue;
    }
    setNestedObject(form, path.map(String), value);
  }
  return convertSequentialObjectsToArrays(form);
}

// src/head.ts
var serverHeadProviderId = "server";
function ensureElementHasInertiaAttribute(element, index) {
  if (element.match(/\sdata-inertia(=|\s|>)/)) {
    return element;
  }
  return element.replace(/^<([a-zA-Z][^\s/>]*)/, `<$1 data-inertia="server-head-${index}"`);
}
function resolveServerHead(page2, serverHead) {
  if (!serverHead) {
    return [];
  }
  const elements = typeof serverHead === "function" ? serverHead(page2) : page2.props[serverHead === true ? "head" : serverHead];
  if (!Array.isArray(elements)) {
    return [];
  }
  return elements.map((element) => typeof element === "string" ? element.trim() : element).filter((element) => typeof element === "string" && element.length > 0).map(ensureElementHasInertiaAttribute);
}
var Renderer = {
  buildDOMElement(tag) {
    const template = document.createElement("template");
    template.innerHTML = tag;
    const node = template.content.firstChild;
    if (!tag.startsWith("<script ")) {
      return node;
    }
    const script = document.createElement("script");
    script.innerHTML = node.innerHTML;
    node.getAttributeNames().forEach((name) => {
      script.setAttribute(name, node.getAttribute(name) || "");
    });
    return script;
  },
  isInertiaManagedElement(element) {
    return element.nodeType === Node.ELEMENT_NODE && element.getAttribute("data-inertia") !== null;
  },
  findMatchingElementIndex(element, elements) {
    const key = element.getAttribute("data-inertia");
    if (key !== null) {
      return elements.findIndex((element2) => element2.getAttribute("data-inertia") === key);
    }
    return -1;
  },
  update: debounce(function(elements) {
    const sourceElements = elements.map((element) => this.buildDOMElement(element));
    const targetElements = Array.from(document.head.childNodes).filter(
      (element) => this.isInertiaManagedElement(element)
    );
    if (sourceElements.some((element) => element instanceof HTMLTitleElement)) {
      document.head.querySelectorAll("title:not([data-inertia])").forEach((title) => title.remove());
    }
    targetElements.forEach((targetElement) => {
      const index = this.findMatchingElementIndex(targetElement, sourceElements);
      if (index === -1) {
        targetElement.remove();
        return;
      }
      const sourceElement = sourceElements.splice(index, 1)[0];
      if (sourceElement && !targetElement.isEqualNode(sourceElement)) {
        targetElement.replaceWith(sourceElement);
      }
    });
    sourceElements.forEach((element) => {
      document.head.appendChild(element);
    });
  }, 1)
};
function createHeadManager(isServer3, titleCallback, onUpdate, initialServerHead = []) {
  const states = initialServerHead.length ? { [serverHeadProviderId]: initialServerHead } : {};
  let lastProviderId = 0;
  function connect() {
    const id = lastProviderId += 1;
    states[id] = [];
    return id.toString();
  }
  function disconnect(id) {
    if (id === null || Object.keys(states).indexOf(id) === -1) {
      return;
    }
    delete states[id];
    commit();
  }
  function reconnect(id) {
    if (Object.keys(states).indexOf(id) === -1) {
      states[id] = [];
    }
  }
  function update(id, elements = []) {
    if (id !== null && Object.keys(states).indexOf(id) > -1) {
      states[id] = elements;
    }
    commit();
  }
  function updateServerHead(elements = []) {
    if (elements.length) {
      states[serverHeadProviderId] = elements;
    } else {
      delete states[serverHeadProviderId];
    }
    commit();
  }
  function collect() {
    const title = titleCallback("");
    const serverHead = states[serverHeadProviderId] || [];
    const providerHead = Object.keys(states).filter((id) => id !== serverHeadProviderId).flatMap((id) => states[id]);
    const defaults = {
      ...title ? { title: `<title data-inertia="">${title}</title>` } : {}
    };
    const elements = serverHead.concat(providerHead).reduce((carry, element) => {
      if (element.indexOf("<") === -1) {
        return carry;
      }
      if (element.indexOf("<title ") === 0) {
        const title2 = element.match(/(<title [^>]+>)(.*?)(<\/title>)/s);
        carry.title = title2 ? `${title2[1]}${titleCallback(title2[2])}${title2[3]}` : element;
        return carry;
      }
      const match = element.match(/ data-inertia=(["'])[^"']+\1/);
      if (match) {
        carry[match[0]] = element;
      } else {
        carry[Object.keys(carry).length] = element;
      }
      return carry;
    }, defaults);
    return Object.values(elements);
  }
  function commit() {
    isServer3 ? onUpdate(collect()) : Renderer.update(collect());
  }
  commit();
  return {
    forceUpdate: commit,
    updateServerHead,
    createProvider: function() {
      const id = connect();
      return {
        reconnect: () => reconnect(id),
        update: (elements) => update(id, elements),
        disconnect: () => disconnect(id)
      };
    }
  };
}

// src/infiniteScroll/data.ts
var MERGE_INTENT_HEADER = "X-Inertia-Infinite-Scroll-Merge-Intent";
var useInfiniteScrollData = (options) => {
  const getScrollPropFromCurrentPage = () => {
    const scrollProp = page.get().scrollProps?.[options.getPropName()];
    if (scrollProp) {
      return scrollProp;
    }
    throw new Error(`The page object does not contain a scroll prop named "${options.getPropName()}".`);
  };
  const state = {
    component: null,
    loading: false,
    previousPage: null,
    nextPage: null,
    lastLoadedPage: null,
    requestCount: 0
  };
  const resetState = () => {
    const scrollProp = getScrollPropFromCurrentPage();
    state.component = page.get().component;
    state.loading = false;
    state.previousPage = scrollProp.previousPage;
    state.nextPage = scrollProp.nextPage;
    state.lastLoadedPage = scrollProp.currentPage;
    state.requestCount = 0;
  };
  const getRememberKey = () => `inertia:infinite-scroll-data:${options.getPropName()}`;
  if (typeof window !== "undefined") {
    resetState();
    const rememberedState = router.restore(getRememberKey());
    if (rememberedState && typeof rememberedState === "object" && rememberedState.lastLoadedPage === getScrollPropFromCurrentPage().currentPage) {
      state.previousPage = rememberedState.previousPage;
      state.nextPage = rememberedState.nextPage;
      state.lastLoadedPage = rememberedState.lastLoadedPage;
      state.requestCount = rememberedState.requestCount || 0;
    }
  }
  const removeEventListener = router.on("success", (event) => {
    if (state.component === event.detail.page.component && getScrollPropFromCurrentPage().reset) {
      resetState();
      options.onReset?.();
    }
  });
  const getScrollPropKeyForSide = (side) => {
    return side === "next" ? "nextPage" : "previousPage";
  };
  const findPageToLoad = (side) => {
    const pagePropName = getScrollPropKeyForSide(side);
    return state[pagePropName];
  };
  const syncStateOnSuccess = (side) => {
    const scrollProp = getScrollPropFromCurrentPage();
    const paginationProp = getScrollPropKeyForSide(side);
    state.lastLoadedPage = scrollProp.currentPage;
    state[paginationProp] = scrollProp[paginationProp];
    state.requestCount += 1;
    router.remember(
      {
        previousPage: state.previousPage,
        nextPage: state.nextPage,
        lastLoadedPage: state.lastLoadedPage,
        requestCount: state.requestCount
      },
      getRememberKey()
    );
  };
  const getPageName = () => getScrollPropFromCurrentPage().pageName;
  const getRequestCount = () => state.requestCount;
  const fetchPage = (side, reloadOptions = {}) => {
    const page2 = findPageToLoad(side);
    if (state.loading || page2 === null) {
      return;
    }
    state.loading = true;
    router.reload({
      preserveErrors: true,
      ...reloadOptions,
      data: { ...reloadOptions.data || {}, [getPageName()]: page2 },
      only: [...reloadOptions.only || [], options.getPropName()],
      preserveUrl: true,
      // we handle URL updates manually via useInfiniteScrollQueryString()
      headers: {
        [MERGE_INTENT_HEADER]: side === "previous" ? "prepend" : "append",
        ...reloadOptions.headers
      },
      onBefore: (visit) => {
        side === "next" ? options.onBeforeNextRequest() : options.onBeforePreviousRequest();
        reloadOptions.onBefore?.(visit);
      },
      onBeforeUpdate: (page3) => {
        options.onBeforeUpdate();
        reloadOptions.onBeforeUpdate?.(page3);
      },
      onSuccess: (page3) => {
        syncStateOnSuccess(side);
        reloadOptions.onSuccess?.(page3);
      },
      onFinish: (visit) => {
        state.loading = false;
        const completed = visit.completed;
        const page3 = completed ? state.lastLoadedPage : null;
        side === "next" ? options.onCompleteNextRequest(page3, { page: page3, completed }) : options.onCompletePreviousRequest(page3, { page: page3, completed });
        reloadOptions.onFinish?.(visit);
      }
    });
  };
  const getLastLoadedPage = () => state.lastLoadedPage;
  const hasPrevious = () => !!state.previousPage;
  const hasNext = () => !!state.nextPage;
  const fetchPrevious = (reloadOptions) => fetchPage("previous", reloadOptions);
  const fetchNext = (reloadOptions) => fetchPage("next", reloadOptions);
  return {
    getLastLoadedPage,
    getPageName,
    getRequestCount,
    hasPrevious,
    hasNext,
    fetchNext,
    fetchPrevious,
    removeEventListener
  };
};

// src/intersectionObservers.ts
var useIntersectionObservers = () => {
  const intersectionObservers = [];
  const newIntersectionObserver = (callback, options = {}) => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          callback(entry);
        }
      }
    }, options);
    intersectionObservers.push(observer);
    return observer;
  };
  const flushAll = () => {
    intersectionObservers.forEach((observer) => observer.disconnect());
    intersectionObservers.length = 0;
  };
  return {
    new: newIntersectionObserver,
    flushAll
  };
};

// src/infiniteScroll/elements.ts
var INFINITE_SCROLL_PAGE_KEY = "infiniteScrollPage";
var INFINITE_SCROLL_IGNORE_KEY = "infiniteScrollIgnore";
var getPageFromElement = (element) => element.dataset[INFINITE_SCROLL_PAGE_KEY];
var useInfiniteScrollElementManager = (options) => {
  const intersectionObservers = useIntersectionObservers();
  let itemsObserver;
  let startElementObserver;
  let endElementObserver;
  let itemsMutationObserver;
  let triggersEnabled = false;
  const setupObservers = () => {
    itemsMutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
          }
          addedElements.add(node);
        });
      });
      rememberElementsDebounced();
    });
    itemsMutationObserver.observe(options.getItemsElement(), { childList: true });
    itemsObserver = intersectionObservers.new(
      (entry) => options.onItemIntersected(entry.target)
    );
    const observerOptions = {
      root: options.getScrollableParent(),
      rootMargin: `${Math.max(1, options.getTriggerMargin())}px`
    };
    startElementObserver = intersectionObservers.new(options.onPreviousTriggered, observerOptions);
    endElementObserver = intersectionObservers.new(options.onNextTriggered, observerOptions);
  };
  const enableTriggers = () => {
    if (triggersEnabled) {
      disableTriggers();
    }
    const startElement = options.getStartElement();
    const endElement = options.getEndElement();
    if (startElement && options.shouldFetchPrevious()) {
      startElementObserver.observe(startElement);
    }
    if (endElement && options.shouldFetchNext()) {
      endElementObserver.observe(endElement);
    }
    triggersEnabled = true;
  };
  const disableTriggers = () => {
    if (!triggersEnabled) {
      return;
    }
    startElementObserver.disconnect();
    endElementObserver.disconnect();
    triggersEnabled = false;
  };
  const refreshTriggers = () => {
    if (triggersEnabled) {
      enableTriggers();
    }
  };
  const flushAll = () => {
    disableTriggers();
    intersectionObservers.flushAll();
    itemsMutationObserver?.disconnect();
  };
  const addedElements = /* @__PURE__ */ new Set();
  const elementIsUntagged = (element) => !(INFINITE_SCROLL_PAGE_KEY in element.dataset) && !(INFINITE_SCROLL_IGNORE_KEY in element.dataset);
  const processManuallyAddedElements = () => {
    Array.from(addedElements).forEach((element) => {
      if (elementIsUntagged(element)) {
        element.dataset[INFINITE_SCROLL_IGNORE_KEY] = "true";
      }
      itemsObserver.observe(element);
    });
    addedElements.clear();
  };
  const findUntaggedElements = (containerElement) => {
    return Array.from(
      containerElement.querySelectorAll(
        `:scope > *:not([data-infinite-scroll-page]):not([data-infinite-scroll-ignore])`
      )
    );
  };
  let hasRestoredElements = false;
  const processServerLoadedElements = (loadedPage) => {
    if (!hasRestoredElements) {
      hasRestoredElements = true;
      if (restoreElements()) {
        return;
      }
    }
    findUntaggedElements(options.getItemsElement()).forEach((element) => {
      if (elementIsUntagged(element)) {
        element.dataset[INFINITE_SCROLL_PAGE_KEY] = loadedPage?.toString() || "1";
      }
      itemsObserver.observe(element);
    });
    rememberElements();
  };
  const getElementsRememberKey = () => `inertia:infinite-scroll-elements:${options.getPropName()}`;
  const rememberElements = () => {
    const pageElementRange = {};
    const childNodes = options.getItemsElement().childNodes;
    for (let index = 0; index < childNodes.length; index++) {
      const node = childNodes[index];
      if (node.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }
      const page2 = getPageFromElement(node);
      if (typeof page2 === "undefined") {
        continue;
      }
      if (!(page2 in pageElementRange)) {
        pageElementRange[page2] = { from: index, to: index };
      } else {
        pageElementRange[page2].to = index;
      }
    }
    router.remember(pageElementRange, getElementsRememberKey());
  };
  const rememberElementsDebounced = debounce(rememberElements, 250);
  const restoreElements = () => {
    const pageElementRange = router.restore(getElementsRememberKey());
    if (!pageElementRange || typeof pageElementRange !== "object") {
      return false;
    }
    const childNodes = options.getItemsElement().childNodes;
    for (let index = 0; index < childNodes.length; index++) {
      const node = childNodes[index];
      if (node.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }
      const element = node;
      let elementPage;
      for (const [page2, range] of Object.entries(pageElementRange)) {
        if (index >= range.from && index <= range.to) {
          elementPage = page2;
          break;
        }
      }
      if (elementPage) {
        element.dataset[INFINITE_SCROLL_PAGE_KEY] = elementPage;
      } else if (!elementIsUntagged(element)) {
        continue;
      } else {
        element.dataset[INFINITE_SCROLL_IGNORE_KEY] = "true";
      }
      itemsObserver.observe(element);
    }
    return true;
  };
  return {
    setupObservers,
    enableTriggers,
    disableTriggers,
    refreshTriggers,
    flushAll,
    processManuallyAddedElements,
    processServerLoadedElements
  };
};

// src/infiniteScroll/queryString.ts
var queue3 = new Queue();
var initialUrl;
var payloadUrl;
var initialUrlWasAbsolute = null;
var useInfiniteScrollQueryString = (options) => {
  let enabled = true;
  const queuePageUpdate = (page2) => {
    queue3.add(() => {
      return new Promise((resolve) => {
        if (!enabled) {
          initialUrl = payloadUrl = null;
          return resolve();
        }
        if (!initialUrl || !payloadUrl) {
          const currentPageUrl = page.get().url;
          initialUrl = hrefToUrl(currentPageUrl);
          payloadUrl = hrefToUrl(currentPageUrl);
          initialUrlWasAbsolute = urlHasProtocol(currentPageUrl);
        }
        const pageName = options.getPageName();
        const searchParams = payloadUrl.searchParams;
        if (page2 === "1") {
          searchParams.delete(pageName);
        } else {
          searchParams.set(pageName, page2);
        }
        setTimeout(() => resolve());
      });
    }).finally(() => {
      if (enabled && initialUrl && payloadUrl && initialUrl.href !== payloadUrl.href && initialUrlWasAbsolute !== null) {
        router.replace({
          url: urlToString(payloadUrl, initialUrlWasAbsolute),
          preserveScroll: true,
          preserveState: true
        });
      }
      initialUrl = payloadUrl = initialUrlWasAbsolute = null;
    });
  };
  const onItemIntersected = debounce((itemElement) => {
    const itemsElement = options.getItemsElement();
    if (!enabled || options.shouldPreserveUrl() || !itemElement || !itemsElement) {
      return;
    }
    const pageMap = /* @__PURE__ */ new Map();
    const elements = [...itemsElement.children];
    getElementsInViewportFromCollection(elements, itemElement).forEach((element) => {
      const page2 = getPageFromElement(element) ?? "1";
      if (pageMap.has(page2)) {
        pageMap.set(page2, pageMap.get(page2) + 1);
      } else {
        pageMap.set(page2, 1);
      }
    });
    const sortedPages = Array.from(pageMap.entries()).sort((a, b) => b[1] - a[1]);
    const mostVisiblePage = sortedPages[0]?.[0];
    if (mostVisiblePage !== void 0) {
      queuePageUpdate(mostVisiblePage);
    }
  }, 250);
  return {
    onItemIntersected,
    cancel: () => enabled = false
  };
};

// src/infiniteScroll/scrollPreservation.ts
var useInfiniteScrollPreservation = (options) => {
  const createCallbacks = () => {
    let currentScrollTop;
    let referenceElement = null;
    let referenceElementTop = 0;
    const captureScrollPosition = () => {
      const scrollableContainer = options.getScrollableParent();
      const itemsElement = options.getItemsElement();
      currentScrollTop = scrollableContainer?.scrollTop || window.scrollY;
      const visibleElements = getElementsInViewportFromCollection([...itemsElement.children]);
      if (visibleElements.length > 0) {
        referenceElement = visibleElements[0];
        const containerRect = scrollableContainer?.getBoundingClientRect() || { top: 0 };
        const containerTop = scrollableContainer ? containerRect.top : 0;
        const rect = referenceElement.getBoundingClientRect();
        referenceElementTop = rect.top - containerTop;
      }
    };
    const restoreScrollPosition = () => {
      if (!referenceElement) {
        return;
      }
      let attempts = 0;
      let restored = false;
      const restore = () => {
        attempts++;
        if (restored || attempts > 10) {
          return false;
        }
        const scrollableContainer = options.getScrollableParent();
        const containerRect = scrollableContainer?.getBoundingClientRect() || { top: 0 };
        const containerTop = scrollableContainer ? containerRect.top : 0;
        const newRect = referenceElement.getBoundingClientRect();
        const newElementTop = newRect.top - containerTop;
        const adjustment = newElementTop - referenceElementTop;
        if (adjustment === 0) {
          window.requestAnimationFrame(restore);
          return;
        }
        if (scrollableContainer) {
          scrollableContainer.scrollTo({ top: currentScrollTop + adjustment });
        } else {
          window.scrollTo(0, window.scrollY + adjustment);
        }
        restored = true;
      };
      window.requestAnimationFrame(restore);
    };
    return {
      captureScrollPosition,
      restoreScrollPosition
    };
  };
  return {
    createCallbacks
  };
};

// src/infiniteScroll.ts
function useInfiniteScroll(options) {
  const queryStringManager = useInfiniteScrollQueryString({ ...options, getPageName: () => dataManager.getPageName() });
  const scrollPreservation = useInfiniteScrollPreservation(options);
  const elementManager = useInfiniteScrollElementManager({
    ...options,
    // As items enter viewport, update URL to reflect the most visible page
    onItemIntersected: queryStringManager.onItemIntersected,
    onPreviousTriggered: () => dataManager.fetchPrevious(),
    onNextTriggered: () => dataManager.fetchNext()
  });
  const dataManager = useInfiniteScrollData({
    ...options,
    // Before updating page data, tag any manually added DOM elements
    // so they don't get confused with server-loaded content
    onBeforeUpdate: elementManager.processManuallyAddedElements,
    // After successful request, tag new server content
    onCompletePreviousRequest: (_, details) => {
      options.onCompletePreviousRequest(details);
      if (details.completed) {
        requestAnimationFrame(() => elementManager.processServerLoadedElements(details.page), 2);
      }
    },
    onCompleteNextRequest: (_, details) => {
      options.onCompleteNextRequest(details);
      if (details.completed) {
        requestAnimationFrame(() => elementManager.processServerLoadedElements(details.page), 2);
      }
    },
    onReset: options.onDataReset
  });
  const addScrollPreservationCallbacks = (reloadOptions) => {
    const { captureScrollPosition, restoreScrollPosition } = scrollPreservation.createCallbacks();
    const originalOnBeforeUpdate = reloadOptions.onBeforeUpdate || (() => {
    });
    const originalOnSuccess = reloadOptions.onSuccess || (() => {
    });
    reloadOptions.onBeforeUpdate = (page2) => {
      originalOnBeforeUpdate(page2);
      captureScrollPosition();
    };
    reloadOptions.onSuccess = (page2) => {
      originalOnSuccess(page2);
      restoreScrollPosition();
    };
    return reloadOptions;
  };
  const originalFetchNext = dataManager.fetchNext;
  dataManager.fetchNext = (reloadOptions = {}) => {
    reloadOptions = { ...options.getReloadOptions?.(), ...reloadOptions };
    if (options.inReverseMode()) {
      reloadOptions = addScrollPreservationCallbacks(reloadOptions);
    }
    originalFetchNext(reloadOptions);
  };
  const originalFetchPrevious = dataManager.fetchPrevious;
  dataManager.fetchPrevious = (reloadOptions = {}) => {
    reloadOptions = { ...options.getReloadOptions?.(), ...reloadOptions };
    if (!options.inReverseMode()) {
      reloadOptions = addScrollPreservationCallbacks(reloadOptions);
    }
    originalFetchPrevious(reloadOptions);
  };
  const removeEventListener = router.on("success", () => requestAnimationFrame(elementManager.refreshTriggers, 2));
  return {
    dataManager,
    elementManager,
    flush: () => {
      removeEventListener();
      dataManager.removeEventListener();
      elementManager.flushAll();
      queryStringManager.cancel();
    }
  };
}

// src/layout.ts
import { isEqual as isEqual4 } from "es-toolkit";
function createLayoutPropsStore() {
  let shared = {};
  let named = {};
  let snapshot = { shared, named };
  const listeners = /* @__PURE__ */ new Set();
  let pendingNotify = false;
  const updateSnapshot = () => {
    snapshot = { shared, named };
  };
  const notify = () => {
    if (pendingNotify) {
      return;
    }
    pendingNotify = true;
    queueMicrotask(() => {
      pendingNotify = false;
      listeners.forEach((fn) => fn());
    });
  };
  return {
    set(props) {
      const merged = { ...shared, ...props };
      if (isEqual4(shared, merged)) {
        return;
      }
      shared = merged;
      updateSnapshot();
      notify();
    },
    setFor(name, props) {
      const current = named[name] || {};
      const merged = { ...current, ...props };
      if (isEqual4(current, merged)) {
        return;
      }
      named = { ...named, [name]: merged };
      updateSnapshot();
      notify();
    },
    reset() {
      shared = {};
      named = {};
      updateSnapshot();
      notify();
    },
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    get: () => snapshot
  };
}
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function hasComponentKey(value) {
  return isPlainObject(value) && "component" in value;
}
function hasComponentEntry(value, isComponent) {
  return "component" in value && isComponent(value.component);
}
function isNamedLayouts(value, isComponent) {
  if (!isPlainObject(value) || isComponent(value) || hasComponentEntry(value, isComponent)) {
    return false;
  }
  return Object.values(value).every(
    (v) => isComponent(v) || Array.isArray(v) && isComponent(v[0]) || hasComponentKey(v) && isComponent(v.component)
  );
}
function isPropsObject(value, isComponent) {
  return isPlainObject(value) && !isComponent(value) && !hasComponentEntry(value, isComponent) && !isNamedLayouts(value, isComponent);
}
function isPropsObjectOrCallback(value, isComponent) {
  if (isPropsObject(value, isComponent)) {
    return true;
  }
  if (!isPlainObject(value) || isComponent(value) || hasComponentEntry(value, isComponent)) {
    return false;
  }
  const values = Object.values(value);
  return values.length > 0 && values.every((v) => typeof v === "function");
}
function isTuple(value, isComponent) {
  return Array.isArray(value) && value.length === 2 && isComponent(value[0]) && isPlainObject(value[1]) && !isComponent(value[1]);
}
function extract(item, isComponent) {
  if (Array.isArray(item) && isComponent(item[0])) {
    return { component: item[0], props: item[1] ?? {} };
  }
  if (hasComponentKey(item) && isComponent(item.component)) {
    return { component: item.component, props: item.props ?? {} };
  }
  if (isComponent(item)) {
    return { component: item, props: {} };
  }
  throw new Error(`Invalid layout definition: received ${typeof item}`);
}
function normalizeLayouts(layout, isComponent, isRenderFunction) {
  if (!layout || isRenderFunction && isRenderFunction(layout)) {
    return [];
  }
  if (isNamedLayouts(layout, isComponent)) {
    return Object.entries(layout).map(([name, value]) => ({ ...extract(value, isComponent), name }));
  }
  if (isTuple(layout, isComponent)) {
    return [{ component: layout[0], props: layout[1] ?? {} }];
  }
  if (Array.isArray(layout)) {
    return layout.map((item) => extract(item, isComponent));
  }
  if (hasComponentKey(layout) && isComponent(layout.component)) {
    return [{ component: layout.component, props: layout.props ?? {} }];
  }
  if (isComponent(layout)) {
    return [{ component: layout, props: {} }];
  }
  return [];
}

// src/navigationEvents.ts
function isContentEditableOrPrevented(event) {
  return event.target instanceof HTMLElement && event.target.isContentEditable || event.defaultPrevented;
}
function shouldIntercept(event) {
  const isLink = event.currentTarget.tagName.toLowerCase() === "a";
  const target = isLink ? event.currentTarget.target : "";
  return !(isContentEditableOrPrevented(event) || isLink && event.altKey || isLink && event.ctrlKey || isLink && event.metaKey || isLink && event.shiftKey || isLink && target !== "" && target !== "_self" || isLink && "button" in event && event.button !== 0);
}
function shouldNavigate(event) {
  const isButton = event.currentTarget.tagName.toLowerCase() === "button";
  return !isContentEditableOrPrevented(event) && (event.key === "Enter" || isButton && event.key === " ");
}

// src/progress-component.ts
var baseComponentSelector = "nprogress";
var usePopover;
var progress2;
var settings = {
  minimum: 0.08,
  easing: "linear",
  speed: 200,
  trickle: true,
  trickleSpeed: 200,
  showSpinner: true,
  barSelector: '.bar, [role="bar"]',
  spinnerSelector: '.spinner, [role="spinner"]',
  parent: "body",
  color: "#29d",
  includeCSS: true,
  popover: null,
  template: [
    '<div class="bar">',
    '<div class="peg"></div>',
    "</div>",
    '<div class="spinner">',
    '<div class="spinner-icon"></div>',
    "</div>"
  ].join("")
};
var status = null;
var hidden = false;
var configure = (options) => {
  Object.assign(settings, options);
  usePopover = settings.popover ?? "popover" in HTMLElement.prototype;
  if (settings.includeCSS) {
    injectCSS(settings.color);
  }
  progress2 = document.createElement("div");
  progress2.id = baseComponentSelector;
  progress2.setAttribute("aria-hidden", "true");
  progress2.innerHTML = settings.template;
  if (usePopover) {
    progress2.popover = "manual";
  }
};
var set7 = (n) => {
  const started = isStarted();
  n = clamp(n, settings.minimum, 1);
  status = n === 1 ? null : n;
  const progress3 = render(!started);
  const bar = progress3.querySelector(settings.barSelector);
  const speed = settings.speed;
  const ease = settings.easing;
  progress3.offsetWidth;
  queue4((next) => {
    const barStyles = {
      transition: `all ${speed}ms ${ease}`,
      transform: `translate3d(${toBarPercentage(n)}%,0,0)`
    };
    for (const key in barStyles) {
      bar.style[key] = barStyles[key];
    }
    if (n !== 1) {
      return setTimeout(next, speed);
    }
    progress3.style.transition = "none";
    progress3.style.opacity = "1";
    progress3.offsetWidth;
    setTimeout(() => {
      progress3.style.transition = `all ${speed}ms linear`;
      progress3.style.opacity = "0";
      setTimeout(() => {
        remove();
        progress3.style.transition = "";
        progress3.style.opacity = "";
        next();
      }, speed);
    }, speed);
  });
};
var isStarted = () => typeof status === "number";
var start = () => {
  if (!status) {
    set7(0);
  }
  const work = function() {
    setTimeout(function() {
      if (!status) {
        return;
      }
      increaseByRandom();
      work();
    }, settings.trickleSpeed);
  };
  if (settings.trickle) {
    work();
  }
};
var done = (force) => {
  if (!force && !status) {
    return;
  }
  increaseByRandom(0.3 + 0.5 * Math.random());
  set7(1);
};
var increaseByRandom = (amount) => {
  const n = status;
  if (n === null) {
    return start();
  }
  if (n > 1) {
    return;
  }
  amount = typeof amount === "number" ? amount : (() => {
    const ranges = {
      0.1: [0, 0.2],
      0.04: [0.2, 0.5],
      0.02: [0.5, 0.8],
      5e-3: [0.8, 0.99]
    };
    for (const r in ranges) {
      if (n >= ranges[r][0] && n < ranges[r][1]) {
        return parseFloat(r);
      }
    }
    return 0;
  })();
  return set7(clamp(n + amount, 0, 0.994));
};
var render = (fromStart) => {
  if (isRendered()) {
    return document.getElementById(baseComponentSelector);
  }
  document.documentElement.classList.add(`${baseComponentSelector}-busy`);
  const bar = progress2.querySelector(settings.barSelector);
  const perc = fromStart ? "-100" : toBarPercentage(status || 0);
  bar.style.transition = "all 0 linear";
  bar.style.transform = `translate3d(${perc}%,0,0)`;
  if (!settings.showSpinner) {
    progress2.querySelector(settings.spinnerSelector)?.remove();
  }
  if (usePopover) {
    document.body.appendChild(progress2);
    if (!hidden) {
      progress2.showPopover();
    }
  } else {
    const parent = getParent();
    if (parent !== document.body) {
      parent.classList.add(`${baseComponentSelector}-custom-parent`);
    }
    parent.appendChild(progress2);
    if (hidden) {
      progress2.style.display = "none";
    }
  }
  return progress2;
};
var getParent = () => {
  return document.querySelector(settings.parent);
};
var remove = () => {
  document.documentElement.classList.remove(`${baseComponentSelector}-busy`);
  if (usePopover && progress2?.isConnected) {
    try {
      progress2.hidePopover();
    } catch {
    }
  }
  if (!usePopover) {
    getParent().classList.remove(`${baseComponentSelector}-custom-parent`);
  }
  progress2?.remove();
};
var isRendered = () => {
  return document.getElementById(baseComponentSelector) !== null;
};
function clamp(n, min, max) {
  if (n < min) {
    return min;
  }
  if (n > max) {
    return max;
  }
  return n;
}
var toBarPercentage = (n) => (-1 + n) * 100;
var queue4 = /* @__PURE__ */ (() => {
  const pending = [];
  const next = () => {
    const fn = pending.shift();
    if (fn) {
      fn(next);
    }
  };
  return (fn) => {
    pending.push(fn);
    if (pending.length === 1) {
      next();
    }
  };
})();
var injectCSS = (color) => {
  const element = document.createElement("style");
  const nonce = config.get("nonce");
  if (nonce) {
    element.nonce = nonce;
  }
  element.textContent = `
    #${baseComponentSelector} {
      pointer-events: none;
      background: none;
      border: none;
      margin: 0;
      padding: 0;
      overflow: visible;
      inset: unset;
      width: 100%;
      height: 0;
      position: fixed;
      top: 0;
      left: 0;
    }

    #${baseComponentSelector}::backdrop {
      display: none;
    }

    #${baseComponentSelector} .bar {
      background: ${color};

      position: fixed;
      z-index: 1031;
      top: 0;
      left: 0;

      width: 100%;
      height: 2px;
    }

    #${baseComponentSelector} .peg {
      display: block;
      position: absolute;
      right: 0px;
      width: 100px;
      height: 100%;
      box-shadow: 0 0 10px ${color}, 0 0 5px ${color};
      opacity: 1.0;

      transform: rotate(3deg) translate(0px, -4px);
    }

    #${baseComponentSelector} .spinner {
      display: block;
      position: fixed;
      z-index: 1031;
      top: 15px;
      right: 15px;
    }

    #${baseComponentSelector} .spinner-icon {
      width: 18px;
      height: 18px;
      box-sizing: border-box;

      border: solid 2px transparent;
      border-top-color: ${color};
      border-left-color: ${color};
      border-radius: 50%;

      animation: ${baseComponentSelector}-spinner 400ms linear infinite;
    }

    .${baseComponentSelector}-custom-parent {
      overflow: hidden;
      position: relative;
    }

    .${baseComponentSelector}-custom-parent #${baseComponentSelector} .spinner,
    .${baseComponentSelector}-custom-parent #${baseComponentSelector} .bar {
      position: absolute;
    }

    @keyframes ${baseComponentSelector}-spinner {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(element);
};
var show = () => {
  hidden = false;
  if (!progress2?.isConnected) {
    return;
  }
  if (usePopover) {
    try {
      progress2.showPopover();
    } catch {
    }
  } else {
    progress2.style.display = "";
  }
};
var hide = () => {
  hidden = true;
  if (!progress2?.isConnected) {
    return;
  }
  if (usePopover) {
    try {
      progress2.hidePopover();
    } catch {
    }
  } else {
    progress2.style.display = "none";
  }
};
var progress_component_default = {
  configure,
  isStarted,
  done,
  set: set7,
  remove,
  start,
  status,
  show,
  hide
};

// src/progress.ts
var Progress = class {
  hideCount = 0;
  start() {
    progress_component_default.start();
  }
  reveal(force = false) {
    this.hideCount = Math.max(0, this.hideCount - 1);
    if (force || this.hideCount === 0) {
      progress_component_default.show();
    }
  }
  hide() {
    this.hideCount++;
    progress_component_default.hide();
  }
  set(status2) {
    progress_component_default.set(Math.max(0, Math.min(1, status2)));
  }
  finish() {
    progress_component_default.done();
  }
  reset() {
    progress_component_default.set(0);
  }
  remove() {
    progress_component_default.done();
    progress_component_default.remove();
  }
  isStarted() {
    return progress_component_default.isStarted();
  }
  getStatus() {
    return progress_component_default.status;
  }
};
var progress = new Progress();
function addEventListeners(delay) {
  document.addEventListener("inertia:start", (e) => handleStartEvent(e, delay));
  document.addEventListener("inertia:progress", handleProgressEvent);
}
function handleStartEvent(event, delay) {
  if (!event.detail.visit.showProgress) {
    progress.hide();
  }
  const timeout = setTimeout(() => progress.start(), delay);
  document.addEventListener("inertia:finish", (e) => finish(e, timeout), { once: true });
}
function handleProgressEvent(event) {
  if (progress.isStarted() && event.detail.progress?.percentage) {
    progress.set(Math.max(progress.getStatus(), event.detail.progress.percentage / 100 * 0.9));
  }
}
function finish(event, timeout) {
  clearTimeout(timeout);
  if (!progress.isStarted()) {
    return;
  }
  if (event.detail.visit.completed) {
    progress.finish();
  } else if (event.detail.visit.interrupted) {
    progress.reset();
  } else if (event.detail.visit.cancelled) {
    progress.remove();
  }
}
function setupProgress({
  delay = 250,
  color = "#29d",
  includeCSS = true,
  showSpinner = false,
  popover = null
} = {}) {
  addEventListeners(delay);
  progress_component_default.configure({
    showSpinner,
    includeCSS,
    color,
    popover
  });
}

// src/resetFormFields.ts
var FormComponentResetSymbol = /* @__PURE__ */ Symbol("FormComponentReset");
function isFormElement(element) {
  return element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement;
}
function resetInputElement(input, defaultValues) {
  const oldValue = input.value;
  const oldChecked = input.checked;
  switch (input.type.toLowerCase()) {
    case "checkbox":
      input.checked = defaultValues.includes(input.value);
      break;
    case "radio":
      input.checked = defaultValues[0] === input.value;
      break;
    case "file":
      input.value = "";
      break;
    case "button":
    case "submit":
    case "reset":
    case "image":
      break;
    default:
      input.value = defaultValues[0] !== null && defaultValues[0] !== void 0 ? String(defaultValues[0]) : "";
  }
  return input.value !== oldValue || input.checked !== oldChecked;
}
function resetSelectElement(select, defaultValues) {
  const oldValue = select.value;
  const oldSelectedOptions = Array.from(select.selectedOptions).map((opt) => opt.value);
  if (select.multiple) {
    const defaultStrings = defaultValues.map((value) => String(value));
    Array.from(select.options).forEach((option) => {
      option.selected = defaultStrings.includes(option.value);
    });
  } else {
    select.value = defaultValues[0] !== void 0 ? String(defaultValues[0]) : "";
  }
  const newSelectedOptions = Array.from(select.selectedOptions).map((opt) => opt.value);
  const hasChanged = select.multiple ? JSON.stringify(oldSelectedOptions.sort()) !== JSON.stringify(newSelectedOptions.sort()) : select.value !== oldValue;
  return hasChanged;
}
function resetFormElement(element, defaultValues) {
  if (element.disabled) {
    if (element instanceof HTMLInputElement) {
      const oldValue = element.value;
      const oldChecked = element.checked;
      switch (element.type.toLowerCase()) {
        case "checkbox":
        case "radio":
          element.checked = element.defaultChecked;
          return element.checked !== oldChecked;
        case "file":
          element.value = "";
          return oldValue !== "";
        case "button":
        case "submit":
        case "reset":
        case "image":
          return false;
        default:
          element.value = element.defaultValue;
          return element.value !== oldValue;
      }
    } else if (element instanceof HTMLSelectElement) {
      const oldSelectedOptions = Array.from(element.selectedOptions).map((opt) => opt.value);
      Array.from(element.options).forEach((option) => {
        option.selected = option.defaultSelected;
      });
      const newSelectedOptions = Array.from(element.selectedOptions).map((opt) => opt.value);
      return JSON.stringify(oldSelectedOptions.sort()) !== JSON.stringify(newSelectedOptions.sort());
    } else if (element instanceof HTMLTextAreaElement) {
      const oldValue = element.value;
      element.value = element.defaultValue;
      return element.value !== oldValue;
    }
    return false;
  }
  if (element instanceof HTMLInputElement) {
    return resetInputElement(element, defaultValues);
  } else if (element instanceof HTMLSelectElement) {
    return resetSelectElement(element, defaultValues);
  } else if (element instanceof HTMLTextAreaElement) {
    const oldValue = element.value;
    element.value = defaultValues[0] !== void 0 ? String(defaultValues[0]) : "";
    return element.value !== oldValue;
  }
  return false;
}
function resetFieldElements(elements, defaultValues) {
  let hasChanged = false;
  if (elements instanceof RadioNodeList || elements instanceof HTMLCollection) {
    Array.from(elements).forEach((node, index) => {
      if (node instanceof Element && isFormElement(node)) {
        if (node instanceof HTMLInputElement && ["checkbox", "radio"].includes(node.type.toLowerCase())) {
          if (resetFormElement(node, defaultValues)) {
            hasChanged = true;
          }
        } else {
          const indexedDefaultValues = defaultValues[index] !== void 0 ? [defaultValues[index]] : [defaultValues[0] ?? null].filter(Boolean);
          if (resetFormElement(node, indexedDefaultValues)) {
            hasChanged = true;
          }
        }
      }
    });
  } else if (isFormElement(elements)) {
    hasChanged = resetFormElement(elements, defaultValues);
  }
  return hasChanged;
}
function resetFormFields(formElement, defaults, fieldNames) {
  if (!formElement) {
    return;
  }
  const resetEntireForm = !fieldNames || fieldNames.length === 0;
  if (resetEntireForm) {
    const formData = new FormData(formElement);
    const formElementNames = Array.from(formElement.elements).map((el) => isFormElement(el) ? el.name : "").filter(Boolean);
    fieldNames = [.../* @__PURE__ */ new Set([...defaults.keys(), ...formData.keys(), ...formElementNames])];
  }
  let hasChanged = false;
  fieldNames.forEach((fieldName) => {
    const elements = formElement.elements.namedItem(fieldName);
    if (elements) {
      if (resetFieldElements(elements, defaults.getAll(fieldName))) {
        hasChanged = true;
      }
    }
  });
  if (hasChanged && resetEntireForm) {
    formElement.dispatchEvent(
      new CustomEvent("reset", { bubbles: true, cancelable: true, detail: { [FormComponentResetSymbol]: true } })
    );
  }
}

// src/ssrUtils.ts
function buildSSRBody(id, page2, html) {
  const json = JSON.stringify(page2).replace(/\//g, "\\/").replace(/</g, "\\u003c");
  return `<script data-page="${id}" type="application/json">${json}<\/script><div data-server-rendered="true" id="${id}">${html}</div>`;
}

// src/index.ts
var router = new Router();
export {
  FormComponentResetSymbol,
  HttpCancelledError,
  HttpError,
  HttpNetworkError,
  HttpResponseError,
  UseFormUtils,
  XhrHttpClient,
  axiosAdapter,
  buildSSRBody,
  config,
  createHeadManager,
  createLayoutPropsStore,
  exposeInterceptors,
  formDataToObject,
  getInitialPageFromDOM,
  getScrollableParent,
  hasFiles,
  hrefToUrl,
  http,
  interceptors,
  isPathOrSubPath,
  isPropsObject,
  isPropsObjectOrCallback,
  isSameUrlWithoutQueryOrHash,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  normalizeLayouts,
  objectToFormData,
  partialReloadRequestsProp,
  partialReloadRequestsSomeProps,
  progress,
  resetFormFields,
  resolveServerHead,
  resolveUrlMethodPairComponent,
  router,
  setupProgress,
  shouldIntercept,
  shouldNavigate,
  urlHasProtocol,
  urlToString,
  urlWithoutHash,
  useInfiniteScroll,
  xhrHttpClient
};
/* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
 * @license MIT */
//# sourceMappingURL=index.js.map
