// src/index.ts
import { config as coreConfig } from "@inertiajs/core";
import { http as http2, progress, router as router3 } from "@inertiajs/core";

// src/App.ts
import {
  createHeadManager,
  isPropsObject,
  isPropsObjectOrCallback,
  normalizeLayouts,
  resolveServerHead,
  router
} from "@inertiajs/core";
import {
  createElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from "react";
import { flushSync } from "react-dom";

// src/HeadContext.ts
import { createContext } from "react";
var headContext = createContext(null);
headContext.displayName = "InertiaHeadContext";
var HeadContext_default = headContext;

// src/layoutProps.ts
import { createLayoutPropsStore } from "@inertiajs/core";
var store = createLayoutPropsStore();
function setLayoutProps(nameOrProps, props) {
  if (typeof nameOrProps === "string") {
    store.setFor(nameOrProps, props);
  } else {
    store.set(nameOrProps);
  }
}
function resetLayoutProps() {
  store.reset();
}

// src/PageContext.ts
import { createContext as createContext2 } from "react";
var pageContext = createContext2(null);
pageContext.displayName = "InertiaPageContext";
var PageContext_default = pageContext;

// src/App.ts
function isComponent(value) {
  return typeof value === "function" || typeof value === "object" && value !== null && "$$typeof" in value;
}
function isRenderFunction(value) {
  if (typeof value !== "function") {
    return false;
  }
  const fn = value;
  return fn.length === 1 && typeof fn.prototype === "undefined";
}
function isLayoutResolver(value) {
  return typeof value === "function" && value.length <= 1 && typeof value.prototype === "undefined";
}
var pendingInitialSwap = null;
var routerIsInitialized = false;
var swapComponent = async (args) => {
  pendingInitialSwap = args;
};
var emptySnapshot = {
  shared: {},
  named: {}
};
function App({
  children,
  initialPage,
  initialComponent,
  resolveComponent,
  titleCallback,
  onHeadUpdate,
  defaultLayout,
  serverHead
}) {
  const [current, setCurrent] = useState({
    component: initialComponent || null,
    page: { ...initialPage, flash: initialPage.flash ?? {} },
    key: null
  });
  const pageRef = useRef(current.page);
  pageRef.current = current.page;
  const headManager = useMemo(() => {
    return createHeadManager(
      typeof window === "undefined",
      (title) => titleCallback ? titleCallback(title, pageRef.current) : title,
      onHeadUpdate || (() => {
      }),
      resolveServerHead(initialPage, serverHead)
    );
  }, []);
  const dynamicLayoutProps = useSyncExternalStore(store.subscribe, store.get, () => emptySnapshot);
  if (!routerIsInitialized) {
    router.init({
      initialPage,
      resolveComponent,
      swapComponent: async (args) => swapComponent(args),
      onFlash: (flash) => {
        setCurrent((current2) => ({
          ...current2,
          page: { ...current2.page, flash }
        }));
      }
    });
    routerIsInitialized = true;
  }
  useEffect(() => {
    swapComponent = async ({ component, page, preserveState, initialRender }) => {
      if (initialRender) {
        return;
      }
      if (!preserveState) {
        resetLayoutProps();
      }
      flushSync(
        () => setCurrent((current2) => ({
          component,
          page,
          key: preserveState ? current2.key : Date.now()
        }))
      );
    };
    if (pendingInitialSwap) {
      const pending = pendingInitialSwap;
      pendingInitialSwap = null;
      swapComponent(pending);
    }
    const syncServerHead = (event) => {
      headManager.updateServerHead(resolveServerHead(event.detail.page, serverHead));
    };
    const removeNavigateListener = router.on("navigate", syncServerHead);
    const removeClientVisitListener = router.on("clientVisit", syncServerHead);
    return () => {
      removeNavigateListener();
      removeClientVisitListener();
    };
  }, []);
  if (!current.component) {
    return createElement(
      HeadContext_default.Provider,
      { value: headManager },
      createElement(PageContext_default.Provider, { value: current.page }, null)
    );
  }
  const renderChildren = children || (({ Component, props, key }) => {
    const child = createElement(Component, { key, ...props });
    let effectiveLayout;
    let callbackProps = null;
    const layoutValue = Component.layout;
    if (isLayoutResolver(layoutValue)) {
      const result = layoutValue(props);
      if (isValidElement(result)) {
        return layoutValue(child);
      }
      if (isPropsObjectOrCallback(result, isComponent)) {
        effectiveLayout = defaultLayout?.(current.page.component, current.page);
        callbackProps = result;
      } else {
        effectiveLayout = result;
      }
    } else if (isPropsObject(layoutValue, isComponent)) {
      effectiveLayout = defaultLayout?.(current.page.component, current.page);
      callbackProps = layoutValue;
    } else {
      effectiveLayout = layoutValue ?? defaultLayout?.(current.page.component, current.page);
    }
    let layouts = normalizeLayouts(
      effectiveLayout,
      isComponent,
      layoutValue && !callbackProps ? isRenderFunction : void 0
    );
    if (callbackProps) {
      layouts = layouts.map((l) => ({ ...l, props: { ...l.props, ...callbackProps } }));
    }
    if (layouts.length > 0) {
      return layouts.reduceRight((childNode, layout) => {
        return createElement(
          layout.component,
          {
            ...props,
            ...layout.props,
            ...dynamicLayoutProps.shared,
            ...layout.name ? dynamicLayoutProps.named[layout.name] || {} : {}
          },
          childNode
        );
      }, child);
    }
    return child;
  });
  return createElement(
    HeadContext_default.Provider,
    { value: headManager },
    createElement(
      PageContext_default.Provider,
      { value: current.page },
      renderChildren({
        Component: current.component,
        key: current.key,
        props: current.page.props
      })
    )
  );
}
App.displayName = "Inertia";

// src/createInertiaApp.ts
import {
  buildSSRBody,
  exposeInterceptors,
  getInitialPageFromDOM,
  http as httpModule,
  router as router2,
  setupProgress
} from "@inertiajs/core";
import { createElement as createElement2, StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
async function createInertiaApp({
  id = "app",
  resolve,
  setup,
  title,
  progress: progress2 = {},
  page,
  render,
  defaults = {},
  nonce,
  http: http3,
  layout,
  serverHead,
  strictMode = false,
  withApp,
  dev = !!import.meta.env?.DEV
} = {}) {
  config.replace(defaults);
  if (nonce) {
    config.set("nonce", nonce);
  }
  if (http3) {
    httpModule.setClient(http3);
  }
  if (dev) {
    exposeInterceptors();
  }
  const isServer = typeof window === "undefined";
  const wrapWithStrictMode = (element) => {
    return strictMode ? createElement2(StrictMode, null, element) : element;
  };
  const resolveComponent = (name, page2) => Promise.resolve(resolve(name, page2)).then((module) => {
    return module.default || module;
  });
  if (isServer && !page && !render) {
    return async (page2, renderToString) => {
      let head2 = [];
      const initialComponent = await resolveComponent(page2.component, page2);
      const props = {
        initialPage: page2,
        initialComponent,
        resolveComponent,
        titleCallback: title,
        onHeadUpdate: (elements) => head2 = elements,
        defaultLayout: layout,
        serverHead
      };
      let reactApp2;
      if (setup) {
        reactApp2 = setup({
          el: null,
          App,
          props
        });
      } else {
        reactApp2 = wrapWithStrictMode(createElement2(App, props));
        if (withApp) {
          reactApp2 = withApp(reactApp2, { ssr: true, page: page2 });
        }
      }
      const html = renderToString(reactApp2);
      const body = buildSSRBody(id, page2, html);
      return { head: head2, body };
    };
  }
  const initialPage = page || getInitialPageFromDOM(id);
  let head = [];
  const reactApp = await Promise.all([
    resolveComponent(initialPage.component, initialPage),
    router2.decryptHistory().catch(() => {
    })
  ]).then(([initialComponent]) => {
    const props = {
      initialPage,
      initialComponent,
      resolveComponent,
      titleCallback: title,
      onHeadUpdate: isServer ? (elements) => head = elements : void 0,
      defaultLayout: layout,
      serverHead
    };
    if (isServer) {
      return setup({
        el: null,
        App,
        props
      });
    }
    const el = document.getElementById(id);
    if (setup) {
      return setup({
        el,
        App,
        props
      });
    }
    let appElement = wrapWithStrictMode(createElement2(App, props));
    if (withApp) {
      appElement = withApp(appElement, { ssr: false, page: initialPage });
    }
    if (el.hasAttribute("data-server-rendered")) {
      hydrateRoot(el, appElement);
    } else {
      createRoot(el).render(appElement);
    }
  });
  if (!isServer && progress2) {
    setupProgress(progress2);
  }
  if (isServer && render && reactApp) {
    const html = render(reactApp);
    const body = buildSSRBody(id, initialPage, html);
    return { head, body };
  }
}

// src/Deferred.ts
import { isSameUrlWithoutQueryOrHash, partialReloadRequestsSomeProps } from "@inertiajs/core";
import { get } from "es-toolkit/compat";
import { useEffect as useEffect2, useMemo as useMemo2, useRef as useRef2, useState as useState2 } from "react";

// src/usePage.ts
import { use } from "react";
function usePage() {
  const page = use(PageContext_default);
  if (!page) {
    throw new Error("usePage must be used within the Inertia component");
  }
  return page;
}

// src/Deferred.ts
var Deferred = ({ children, data, rescue, fallback }) => {
  if (!data) {
    throw new Error("`<Deferred>` requires a `data` prop to be a string or array of strings");
  }
  if (!fallback) {
    throw new Error("`<Deferred>` requires a `fallback` prop");
  }
  const [reloading, setReloading] = useState2(false);
  const activeReloads = useRef2(/* @__PURE__ */ new Set());
  const page = usePage();
  const pageProps = page.props;
  const keys = useMemo2(() => Array.isArray(data) ? data : [data], [data]);
  const rescuedKeys = useMemo2(() => new Set(page.rescuedProps), [page.rescuedProps]);
  useEffect2(() => {
    const removeStartListener = router3.on("start", (e) => {
      const visit = e.detail.visit;
      if (visit.preserveState === true && isSameUrlWithoutQueryOrHash(visit.url, window.location) && partialReloadRequestsSomeProps(visit, keys)) {
        activeReloads.current.add(visit);
        setReloading(true);
      }
    });
    const removeFinishListener = router3.on("finish", (e) => {
      const visit = e.detail.visit;
      if (activeReloads.current.has(visit)) {
        activeReloads.current.delete(visit);
        setReloading(activeReloads.current.size > 0);
      }
    });
    return () => {
      removeStartListener();
      removeFinishListener();
      activeReloads.current.clear();
    };
  }, [keys]);
  const propsAreDefined = useMemo2(() => keys.every((key) => get(pageProps, key) !== void 0), [keys, pageProps]);
  const hasRescuedProps = useMemo2(() => keys.some((key) => rescuedKeys.has(key)), [keys, rescuedKeys]);
  if (propsAreDefined && !hasRescuedProps) {
    if (typeof children === "function") {
      return children({ reloading });
    }
    return children;
  }
  if (hasRescuedProps && rescue) {
    return typeof rescue === "function" ? rescue({ reloading }) : rescue;
  }
  return typeof fallback === "function" ? fallback() : fallback;
};
Deferred.displayName = "InertiaDeferred";
var Deferred_default = Deferred;

// src/Form.ts
import {
  config as config2,
  FormComponentResetSymbol,
  formDataToObject,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  resetFormFields,
  resolveUrlMethodPairComponent,
  UseFormUtils as UseFormUtils3
} from "@inertiajs/core";
import { isEqual as isEqual2 } from "es-toolkit";
import React, {
  createContext as createContext3,
  createElement as createElement3,
  forwardRef,
  use as use2,
  useEffect as useEffect5,
  useImperativeHandle,
  useMemo as useMemo4,
  useRef as useRef5,
  useState as useState5
} from "react";

// src/useForm.ts
import {
  router as router5,
  UseFormUtils as UseFormUtils2
} from "@inertiajs/core";
import { cloneDeep as cloneDeep2 } from "es-toolkit";
import { useCallback as useCallback2, useMemo as useMemo3, useRef as useRef4 } from "react";

// src/useFormState.ts
import {
  UseFormUtils
} from "@inertiajs/core";
import { cloneDeep, isEqual } from "es-toolkit";
import { get as get2, has, set } from "es-toolkit/compat";
import {
  createValidator,
  resolveName,
  toSimpleValidationErrors
} from "laravel-precognition";
import { useCallback, useEffect as useEffect3, useRef as useRef3, useState as useState3 } from "react";
function useFormState(options) {
  const { data: dataOption, useDataState, useErrorsState } = options;
  const isDataFunction = typeof dataOption === "function";
  const resolveData = () => isDataFunction ? dataOption() : dataOption;
  const initialData = cloneDeep(resolveData());
  const isMounted = useRef3(false);
  const precognitionEndpointRef = useRef3(options.precognitionEndpoint ?? null);
  const [defaults, setDefaultsState] = useState3(cloneDeep(initialData));
  const [data, setData] = useDataState ? useDataState() : useState3(cloneDeep(initialData));
  const [errors, setErrors] = useErrorsState ? useErrorsState() : useState3({});
  const [processing, setProcessing] = useState3(false);
  const [progress2, setProgress] = useState3(null);
  const [wasSuccessful, setWasSuccessful] = useState3(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState3(false);
  const recentlySuccessfulTimeoutId = useRef3(void 0);
  const transformRef = useRef3((data2) => data2);
  const defaultsCalledInOnSuccessRef = useRef3(false);
  const validatorRef = useRef3(null);
  const [validating, setValidating] = useState3(false);
  const [touchedFields, setTouchedFields] = useState3([]);
  const [validFields, setValidFields] = useState3([]);
  const withAllErrorsRef = useRef3(null);
  const withAllErrorsEnabled = () => withAllErrorsRef.current ?? config.get("form.withAllErrors");
  const dataRef = useRef3(data);
  useEffect3(() => {
    dataRef.current = data;
  });
  useEffect3(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  const commitData = useCallback(
    (next) => {
      dataRef.current = next;
      setData(next);
    },
    [setData]
  );
  const setDataFunction = useCallback(
    (keyOrData, maybeValue) => {
      if (typeof keyOrData === "string") {
        commitData(set(cloneDeep(dataRef.current), keyOrData, maybeValue));
      } else if (typeof keyOrData === "function") {
        commitData(keyOrData(dataRef.current));
      } else {
        commitData(keyOrData);
      }
    },
    [commitData]
  );
  const setDefaultsFunction = useCallback(
    (fieldOrFields, maybeValue) => {
      if (isDataFunction) {
        throw new Error("You cannot call `defaults()` when using a function to define your form data.");
      }
      defaultsCalledInOnSuccessRef.current = true;
      let newDefaults = {};
      if (typeof fieldOrFields === "undefined") {
        newDefaults = { ...dataRef.current };
        setDefaultsState(dataRef.current);
      } else {
        setDefaultsState((defaults2) => {
          newDefaults = typeof fieldOrFields === "string" ? set(cloneDeep(defaults2), fieldOrFields, maybeValue) : Object.assign(cloneDeep(defaults2), fieldOrFields);
          return newDefaults;
        });
      }
      validatorRef.current?.defaults(newDefaults);
    },
    [setDefaultsState]
  );
  const reset = useCallback(
    (...fields) => {
      const resolvedData = isDataFunction ? cloneDeep(resolveData()) : defaults;
      const clonedData = cloneDeep(resolvedData);
      if (fields.length === 0) {
        if (isDataFunction) {
          setDefaultsState(clonedData);
        }
        commitData(clonedData);
      } else {
        if (isDataFunction) {
          setDefaultsState((currentDefaults) => {
            const newDefaults = cloneDeep(currentDefaults);
            fields.filter((key) => has(clonedData, key)).forEach((key) => {
              set(newDefaults, key, get2(clonedData, key));
            });
            return newDefaults;
          });
        }
        const next = fields.filter((key) => has(clonedData, key)).reduce(
          (carry, key) => {
            return set(carry, key, get2(clonedData, key));
          },
          { ...dataRef.current }
        );
        commitData(next);
      }
      validatorRef.current?.reset(...fields);
    },
    [commitData, defaults]
  );
  const setError = useCallback(
    (fieldOrFields, maybeValue) => {
      setErrors((errors2) => {
        const newErrors = {
          ...errors2,
          ...typeof fieldOrFields === "string" ? { [fieldOrFields]: maybeValue } : fieldOrFields
        };
        validatorRef.current?.setErrors(newErrors);
        return newErrors;
      });
    },
    [setErrors]
  );
  const clearErrors = useCallback(
    (...fields) => {
      setErrors((errors2) => {
        const newErrors = Object.keys(errors2).reduce(
          (carry, field) => ({
            ...carry,
            ...fields.length > 0 && !fields.includes(field) ? { [field]: errors2[field] } : {}
          }),
          {}
        );
        if (validatorRef.current) {
          if (fields.length === 0) {
            validatorRef.current.setErrors({});
          } else {
            fields.forEach(validatorRef.current.forgetError);
          }
        }
        return newErrors;
      });
    },
    [setErrors]
  );
  const resetAndClearErrors = useCallback(
    (...fields) => {
      reset(...fields);
      clearErrors(...fields);
    },
    [reset, clearErrors]
  );
  const markAsSuccessful = useCallback(() => {
    clearErrors();
    setWasSuccessful(true);
    setRecentlySuccessful(true);
    recentlySuccessfulTimeoutId.current = window.setTimeout(() => {
      if (isMounted.current) {
        setRecentlySuccessful(false);
      }
    }, config.get("form.recentlySuccessfulDuration"));
  }, [clearErrors, setWasSuccessful, setRecentlySuccessful]);
  const resetBeforeSubmit = useCallback(() => {
    setWasSuccessful(false);
    setRecentlySuccessful(false);
    clearTimeout(recentlySuccessfulTimeoutId.current);
  }, [setWasSuccessful, setRecentlySuccessful]);
  const finishProcessing = useCallback(() => {
    setProcessing(false);
    setProgress(null);
  }, [setProcessing, setProgress]);
  const transformFunction = useCallback((callback) => {
    transformRef.current = callback;
  }, []);
  const tap = (value, callback) => {
    callback(value);
    return value;
  };
  const valid = useCallback(
    (field) => validFields.includes(field),
    [validFields]
  );
  const invalid = useCallback((field) => field in errors, [errors]);
  const touched = useCallback(
    (field) => typeof field === "string" ? touchedFields.includes(field) : touchedFields.length > 0,
    [touchedFields]
  );
  const form = {
    data,
    isDirty: !isEqual(data, defaults),
    errors,
    hasErrors: Object.keys(errors).length > 0,
    processing,
    progress: progress2,
    wasSuccessful,
    recentlySuccessful,
    setData: setDataFunction,
    transform: transformFunction,
    setDefaults: setDefaultsFunction,
    reset,
    setError,
    clearErrors,
    resetAndClearErrors
  };
  const validate = (field, config3) => {
    if (typeof field === "object" && !("target" in field)) {
      config3 = field;
      field = void 0;
    }
    if (field === void 0) {
      validatorRef.current.validate(config3);
    } else {
      const fieldName = resolveName(field);
      const transformedData = transformRef.current(dataRef.current);
      validatorRef.current.validate(fieldName, get2(transformedData, fieldName), config3);
    }
    return form;
  };
  const withPrecognition = (...args) => {
    precognitionEndpointRef.current = UseFormUtils.createWayfinderCallback(...args);
    if (!validatorRef.current) {
      const validator = createValidator(
        (client) => {
          const { method, url } = precognitionEndpointRef.current();
          const currentData = dataRef.current;
          const transformedData = transformRef.current(currentData);
          return client[method](url, transformedData);
        },
        cloneDeep(defaults)
      );
      validatorRef.current = validator;
      validator.on("validatingChanged", () => {
        setValidating(validator.validating());
      }).on("validatedChanged", () => {
        setValidFields(validator.valid());
      }).on("touchedChanged", () => {
        setTouchedFields(validator.touched());
      }).on("errorsChanged", () => {
        const validationErrors = withAllErrorsEnabled() ? validator.errors() : toSimpleValidationErrors(validator.errors());
        setErrors(validationErrors);
        setValidFields(validator.valid());
      });
    }
    const precognitiveForm = Object.assign(form, {
      validating,
      validator: () => validatorRef.current,
      valid,
      invalid,
      touched,
      withoutFileValidation: () => tap(precognitiveForm, () => validatorRef.current?.withoutFileValidation()),
      touch: (field, ...fields) => {
        if (Array.isArray(field)) {
          validatorRef.current?.touch(field);
        } else if (typeof field === "string") {
          validatorRef.current?.touch([field, ...fields]);
        } else {
          validatorRef.current?.touch(field);
        }
        return precognitiveForm;
      },
      withAllErrors: () => tap(precognitiveForm, () => withAllErrorsRef.current = true),
      setValidationTimeout: (duration) => tap(precognitiveForm, () => validatorRef.current?.setTimeout(duration)),
      validateFiles: () => tap(precognitiveForm, () => validatorRef.current?.validateFiles()),
      validate,
      setErrors: (errors2) => tap(precognitiveForm, () => form.setError(errors2)),
      forgetError: (field) => tap(
        precognitiveForm,
        () => form.clearErrors(resolveName(field))
      )
    });
    return precognitiveForm;
  };
  form.withPrecognition = withPrecognition;
  if (precognitionEndpointRef.current) {
    form.withPrecognition(precognitionEndpointRef.current);
  }
  return {
    form,
    setDefaultsState,
    transformRef,
    precognitionEndpointRef,
    dataRef,
    isMounted,
    setProcessing,
    setProgress,
    markAsSuccessful,
    clearErrors,
    setError,
    defaultsCalledInOnSuccessRef,
    resetBeforeSubmit,
    finishProcessing,
    withAllErrors: {
      enabled: withAllErrorsEnabled,
      enable: () => {
        withAllErrorsRef.current = true;
      }
    }
  };
}

// src/useRemember.ts
import { router as router4 } from "@inertiajs/core";
import { useEffect as useEffect4, useState as useState4 } from "react";
function useRemember(initialState, key, excludeKeysRef) {
  const [state, setState] = useState4(() => {
    const restored = router4.restore(key);
    return restored !== void 0 ? restored : initialState;
  });
  useEffect4(() => {
    const keys = excludeKeysRef?.current;
    if (keys && keys.length > 0 && typeof state === "object" && state !== null) {
      const filtered = { ...state };
      keys.forEach((k) => delete filtered[k]);
      router4.remember(filtered, key);
    } else {
      router4.remember(state, key);
    }
  }, [state, key]);
  return [state, setState];
}

// src/useForm.ts
function useForm(...args) {
  const { rememberKey, data, precognitionEndpoint } = UseFormUtils2.parseUseFormArguments(...args);
  const initialDefaults = typeof data === "function" ? cloneDeep2(data()) : cloneDeep2(data);
  const cancelToken = useRef4(null);
  const excludeKeysRef = useRef4([]);
  const pendingOptimisticRef = useRef4(null);
  const useDataState = rememberKey ? () => useRemember(initialDefaults, `${rememberKey}:data`, excludeKeysRef) : void 0;
  const useErrorsState = rememberKey ? () => useRemember({}, `${rememberKey}:errors`) : void 0;
  const {
    form: baseForm,
    setDefaultsState,
    transformRef,
    precognitionEndpointRef,
    dataRef,
    isMounted,
    setProcessing,
    setProgress,
    markAsSuccessful,
    clearErrors,
    setError,
    defaultsCalledInOnSuccessRef,
    resetBeforeSubmit,
    finishProcessing
  } = useFormState({
    data,
    precognitionEndpoint,
    useDataState,
    useErrorsState
  });
  const submit = useCallback2(
    (...args2) => {
      const { method, url, options } = UseFormUtils2.parseSubmitArguments(args2, precognitionEndpointRef.current);
      defaultsCalledInOnSuccessRef.current = false;
      const _options = {
        ...options,
        onCancelToken: (token) => {
          cancelToken.current = token;
          return options.onCancelToken?.(token);
        },
        onBefore: (visit) => {
          resetBeforeSubmit();
          return options.onBefore?.(visit);
        },
        onStart: (visit) => {
          setProcessing(true);
          return options.onStart?.(visit);
        },
        onProgress: (event) => {
          setProgress(event || null);
          return options.onProgress?.(event);
        },
        onSuccess: async (page) => {
          if (isMounted.current) {
            markAsSuccessful();
          }
          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null;
          if (isMounted.current && !defaultsCalledInOnSuccessRef.current) {
            baseForm.setData((data2) => {
              setDefaultsState(cloneDeep2(data2));
              return data2;
            });
          }
          return onSuccess;
        },
        onError: (errors) => {
          if (isMounted.current) {
            clearErrors();
            setError(errors);
          }
          return options.onError?.(errors);
        },
        onCancel: () => {
          return options.onCancel?.();
        },
        onFinish: (visit) => {
          if (isMounted.current) {
            finishProcessing();
          }
          cancelToken.current = null;
          return options.onFinish?.(visit);
        }
      };
      _options.optimistic = _options.optimistic ?? pendingOptimisticRef.current ?? void 0;
      pendingOptimisticRef.current = null;
      const transformedData = transformRef.current(dataRef.current);
      if (method === "delete") {
        router5.delete(url, { ..._options, data: transformedData });
      } else {
        router5[method](url, transformedData, _options);
      }
    },
    [clearErrors, setError, transformRef]
  );
  const cancel = useCallback2(() => {
    if (cancelToken.current) {
      cancelToken.current.cancel();
    }
  }, []);
  const submitMethods = useMemo3(
    () => ({
      get: (url, options = {}) => submit("get", url, options),
      post: (url, options = {}) => submit("post", url, options),
      put: (url, options = {}) => submit("put", url, options),
      patch: (url, options = {}) => submit("patch", url, options),
      delete: (url, options = {}) => submit("delete", url, options)
    }),
    [submit]
  );
  Object.assign(baseForm, {
    submit,
    ...submitMethods,
    cancel,
    dontRemember: (...keys) => {
      excludeKeysRef.current = keys;
      return form;
    },
    optimistic: (callback) => {
      pendingOptimisticRef.current = callback;
      return form;
    }
  });
  const form = baseForm;
  const originalWithPrecognition = baseForm.withPrecognition;
  form.withPrecognition = (...args2) => {
    originalWithPrecognition(...args2);
    return form;
  };
  return precognitionEndpointRef.current ? form : form;
}

// src/Form.ts
var deferStateUpdate = (callback) => {
  typeof React.startTransition === "function" ? React.startTransition(callback) : setTimeout(callback, 0);
};
var noop = () => void 0;
var FormContext = createContext3(void 0);
var Form = forwardRef(
  ({
    action = "",
    method = "get",
    headers = {},
    queryStringArrayFormat = "brackets",
    errorBag = null,
    showProgress = true,
    transform = (data) => data,
    optimistic,
    options = {},
    onStart = noop,
    onProgress = noop,
    onFinish = noop,
    onBefore = noop,
    onCancel = noop,
    onSuccess = noop,
    onError = noop,
    onCancelToken = noop,
    onSubmitComplete = noop,
    disableWhileProcessing = false,
    cancelOnUnmount = false,
    resetOnError = false,
    resetOnSuccess = false,
    setDefaultsOnSuccess = false,
    invalidateCacheTags = [],
    validateFiles = false,
    validationTimeout = 1500,
    withAllErrors = null,
    component = null,
    instant = false,
    children,
    ...props
  }, ref) => {
    const getTransformedData = () => {
      const [_url, data] = getUrlAndData();
      return transform(data);
    };
    const form = useForm({}).withPrecognition(
      () => resolvedMethod,
      () => getUrlAndData()[0]
    ).setValidationTimeout(validationTimeout);
    if (validateFiles) {
      form.validateFiles();
    }
    if (withAllErrors ?? config2.get("form.withAllErrors")) {
      form.withAllErrors();
    }
    form.transform(getTransformedData);
    const formElement = useRef5(void 0);
    const resolvedMethod = useMemo4(() => {
      return isUrlMethodPair(action) ? action.method : method.toLowerCase();
    }, [action, method]);
    const resolvedComponent = useMemo4(() => {
      if (component) {
        return component;
      }
      if (instant && isUrlMethodPair(action)) {
        return resolveUrlMethodPairComponent(action);
      }
      return null;
    }, [component, instant, action]);
    const [isDirty, setIsDirty] = useState5(false);
    const defaultData = useRef5(new FormData());
    const cancelOnUnmountRef = useRef5(cancelOnUnmount);
    cancelOnUnmountRef.current = cancelOnUnmount;
    const getFormData = (submitter) => formElement.current ? new FormData(formElement.current, submitter) : new FormData();
    const getData = (submitter) => formDataToObject(getFormData(submitter));
    const getUrlAndData = (submitter) => {
      return mergeDataIntoQueryString(
        resolvedMethod,
        isUrlMethodPair(action) ? action.url : action,
        getData(submitter),
        queryStringArrayFormat
      );
    };
    const updateDirtyState = (event) => {
      if (event.type === "reset" && event.detail?.[FormComponentResetSymbol]) {
        event.preventDefault();
      }
      deferStateUpdate(
        () => setIsDirty(event.type === "reset" ? false : !isEqual2(getData(), formDataToObject(defaultData.current)))
      );
    };
    const clearErrors = (...names) => {
      form.clearErrors(...names);
      return form;
    };
    useEffect5(() => {
      defaultData.current = getFormData();
      form.setDefaults(getData());
      const formEvents = ["input", "change", "reset"];
      formEvents.forEach((e) => formElement.current.addEventListener(e, updateDirtyState));
      return () => {
        formEvents.forEach((e) => formElement.current?.removeEventListener(e, updateDirtyState));
        if (cancelOnUnmountRef.current) {
          form.cancel();
        }
      };
    }, []);
    useEffect5(() => {
      form.setValidationTimeout(validationTimeout);
    }, [validationTimeout]);
    useEffect5(() => {
      if (validateFiles) {
        form.validateFiles();
      } else {
        form.withoutFileValidation();
      }
    }, [validateFiles]);
    const reset = (...fields) => {
      if (formElement.current) {
        resetFormFields(formElement.current, defaultData.current, fields);
      }
      form.reset(...fields);
    };
    const resetAndClearErrors = (...fields) => {
      clearErrors(...fields);
      reset(...fields);
    };
    const maybeReset = (resetOption) => {
      if (!resetOption) {
        return;
      }
      if (resetOption === true) {
        reset();
      } else if (resetOption.length > 0) {
        reset(...resetOption);
      }
    };
    const submit = (submitter) => {
      const [url, data] = getUrlAndData(submitter);
      const formTarget = submitter?.getAttribute("formtarget");
      if (formTarget === "_blank" && resolvedMethod === "get") {
        window.open(url, "_blank");
        return;
      }
      const submitOptions = {
        headers,
        queryStringArrayFormat,
        errorBag,
        showProgress,
        invalidateCacheTags,
        component: resolvedComponent,
        optimistic: optimistic ? (pageProps) => optimistic(pageProps, data) : void 0,
        onCancelToken,
        onBefore,
        onStart,
        onProgress,
        onFinish,
        onCancel,
        onSuccess: async (...args) => {
          const result = await onSuccess(...args);
          onSubmitComplete({
            reset,
            defaults
          });
          maybeReset(resetOnSuccess);
          if (setDefaultsOnSuccess === true) {
            defaults();
          }
          return result;
        },
        onError(...args) {
          onError(...args);
          maybeReset(resetOnError);
        },
        ...options
      };
      form.transform(() => transform(data));
      form.submit(resolvedMethod, url, submitOptions);
      form.transform(getTransformedData);
    };
    const defaults = () => {
      defaultData.current = getFormData();
      setIsDirty(false);
    };
    const exposed = {
      errors: form.errors,
      hasErrors: form.hasErrors,
      processing: form.processing,
      progress: form.progress,
      wasSuccessful: form.wasSuccessful,
      recentlySuccessful: form.recentlySuccessful,
      isDirty,
      clearErrors,
      resetAndClearErrors,
      setError: form.setError,
      reset,
      submit,
      cancel: form.cancel,
      defaults,
      getData,
      getFormData,
      // Precognition
      validator: () => form.validator(),
      validating: form.validating,
      valid: form.valid,
      invalid: form.invalid,
      validate: (field, config3) => form.validate(...UseFormUtils3.mergeHeadersForValidation(field, config3, headers)),
      touch: form.touch,
      touched: form.touched
    };
    useImperativeHandle(ref, () => exposed, [form, isDirty, submit]);
    const formNode = createElement3(
      "form",
      {
        ...props,
        ref: formElement,
        action: isUrlMethodPair(action) ? action.url : action,
        method: resolvedMethod,
        onSubmit: (event) => {
          event.preventDefault();
          submit(event.nativeEvent.submitter);
        },
        inert: disableWhileProcessing && form.processing
      },
      typeof children === "function" ? children(exposed) : children
    );
    return createElement3(FormContext.Provider, { value: exposed }, formNode);
  }
);
Form.displayName = "InertiaForm";
function useFormContext() {
  return use2(FormContext);
}
var Form_default = Form;

// src/Head.ts
import { escape } from "es-toolkit/compat";
import React2, { use as use3, useEffect as useEffect6, useMemo as useMemo5 } from "react";
var Head = function({ children, title }) {
  const headManager = use3(HeadContext_default);
  const provider = useMemo5(() => headManager.createProvider(), [headManager]);
  const isServer = typeof window === "undefined";
  useEffect6(() => {
    provider.reconnect();
    provider.update(renderNodes(children));
    return () => {
      provider.disconnect();
    };
  }, [provider, children, title]);
  function isUnaryTag(node) {
    return typeof node.type === "string" && [
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr"
    ].indexOf(node.type) > -1;
  }
  function renderTagStart(node) {
    const attrs = Object.keys(node.props).reduce((carry, name) => {
      if (["head-key", "children", "dangerouslySetInnerHTML"].includes(name)) {
        return carry;
      }
      const value = String(node.props[name]);
      if (value === "") {
        return carry + ` ${name}`;
      }
      return carry + ` ${name}="${escape(value)}"`;
    }, "");
    return `<${String(node.type)}${attrs}>`;
  }
  function renderTagChildren(node) {
    const { children: children2 } = node.props;
    if (typeof children2 === "string") {
      return children2;
    }
    if (Array.isArray(children2)) {
      return children2.reduce((html, child) => html + renderTag(child), "");
    }
    return "";
  }
  function renderTag(node) {
    let html = renderTagStart(node);
    if (node.props.children) {
      html += renderTagChildren(node);
    }
    if (node.props.dangerouslySetInnerHTML) {
      html += node.props.dangerouslySetInnerHTML.__html;
    }
    if (!isUnaryTag(node)) {
      html += `</${String(node.type)}>`;
    }
    return html;
  }
  function ensureNodeHasInertiaProp(node) {
    return React2.cloneElement(node, {
      "data-inertia": node.props["head-key"] !== void 0 ? node.props["head-key"] : ""
    });
  }
  function renderNode(node) {
    return renderTag(ensureNodeHasInertiaProp(node));
  }
  function renderNodes(nodes) {
    const elements = React2.Children.toArray(nodes).filter((node) => node).map((node) => renderNode(node));
    if (title && !elements.find((tag) => tag.startsWith("<title"))) {
      elements.push(`<title data-inertia="">${escape(title)}</title>`);
    }
    return elements;
  }
  if (isServer) {
    provider.update(renderNodes(children));
  }
  return null;
};
var Head_default = Head;

// src/InfiniteScroll.ts
import {
  getScrollableParent,
  useInfiniteScroll
} from "@inertiajs/core";
import React3, {
  createElement as createElement4,
  forwardRef as forwardRef2,
  useCallback as useCallback3,
  useEffect as useEffect7,
  useImperativeHandle as useImperativeHandle2,
  useMemo as useMemo6,
  useRef as useRef6,
  useState as useState6
} from "react";
var resolveHTMLElement = (value, fallback) => {
  if (!value) {
    return fallback;
  }
  if (value && typeof value === "object" && "current" in value) {
    return value.current;
  }
  if (typeof value === "string") {
    return document.querySelector(value);
  }
  return fallback;
};
var renderSlot = (slotContent, slotProps, fallback = null) => {
  if (!slotContent) {
    return fallback;
  }
  return typeof slotContent === "function" ? slotContent(slotProps) : slotContent;
};
var InfiniteScroll = forwardRef2(
  ({
    data,
    buffer = 0,
    as = "div",
    manual = false,
    manualAfter = 0,
    preserveUrl = false,
    reverse = false,
    autoScroll,
    children,
    startElement,
    endElement,
    itemsElement,
    previous,
    next,
    loading,
    params = {},
    onlyNext = false,
    onlyPrevious = false,
    ...props
  }, ref) => {
    const [startElementFromRef, setStartElementFromRef] = useState6(null);
    const startElementRef = useCallback3((node) => setStartElementFromRef(node), []);
    const [endElementFromRef, setEndElementFromRef] = useState6(null);
    const endElementRef = useCallback3((node) => setEndElementFromRef(node), []);
    const [itemsElementFromRef, setItemsElementFromRef] = useState6(null);
    const itemsElementRef = useCallback3((node) => setItemsElementFromRef(node), []);
    const scrollProp = usePage().scrollProps?.[data];
    const [loadingPrevious, setLoadingPrevious] = useState6(false);
    const [loadingNext, setLoadingNext] = useState6(false);
    const [requestCount, setRequestCount] = useState6(0);
    const [hasPreviousPage, setHasPreviousPage] = useState6(!!scrollProp?.previousPage);
    const [hasNextPage, setHasNextPage] = useState6(!!scrollProp?.nextPage);
    const [resolvedStartElement, setResolvedStartElement] = useState6(null);
    const [resolvedEndElement, setResolvedEndElement] = useState6(null);
    const [resolvedItemsElement, setResolvedItemsElement] = useState6(null);
    useEffect7(() => {
      const element = startElement ? resolveHTMLElement(startElement, startElementFromRef) : startElementFromRef;
      setResolvedStartElement(element);
    }, [startElement, startElementFromRef]);
    useEffect7(() => {
      const element = endElement ? resolveHTMLElement(endElement, endElementFromRef) : endElementFromRef;
      setResolvedEndElement(element);
    }, [endElement, endElementFromRef]);
    useEffect7(() => {
      const element = itemsElement ? resolveHTMLElement(itemsElement, itemsElementFromRef) : itemsElementFromRef;
      setResolvedItemsElement(element);
    }, [itemsElement, itemsElementFromRef]);
    const scrollableParent = useMemo6(() => getScrollableParent(resolvedItemsElement), [resolvedItemsElement]);
    const callbackPropsRef = useRef6({
      buffer,
      onlyNext,
      onlyPrevious,
      reverse,
      preserveUrl,
      params
    });
    callbackPropsRef.current = {
      buffer,
      onlyNext,
      onlyPrevious,
      reverse,
      preserveUrl,
      params
    };
    const [infiniteScroll, setInfiniteScroll] = useState6(null);
    const dataManager = useMemo6(() => infiniteScroll?.dataManager, [infiniteScroll]);
    const elementManager = useMemo6(() => infiniteScroll?.elementManager, [infiniteScroll]);
    const scrollToBottom = useCallback3(() => {
      if (scrollableParent) {
        scrollableParent.scrollTo({
          top: scrollableParent.scrollHeight,
          behavior: "instant"
        });
      } else {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "instant"
        });
      }
    }, [scrollableParent]);
    useEffect7(() => {
      if (!resolvedItemsElement) {
        return;
      }
      function syncStateFromDataManager() {
        setRequestCount(infiniteScrollInstance.dataManager.getRequestCount());
        setHasPreviousPage(infiniteScrollInstance.dataManager.hasPrevious());
        setHasNextPage(infiniteScrollInstance.dataManager.hasNext());
      }
      const infiniteScrollInstance = useInfiniteScroll({
        // Data
        getPropName: () => data,
        inReverseMode: () => callbackPropsRef.current.reverse,
        shouldFetchNext: () => !callbackPropsRef.current.onlyPrevious,
        shouldFetchPrevious: () => !callbackPropsRef.current.onlyNext,
        shouldPreserveUrl: () => callbackPropsRef.current.preserveUrl,
        getReloadOptions: () => callbackPropsRef.current.params,
        // Elements
        getTriggerMargin: () => callbackPropsRef.current.buffer,
        getStartElement: () => resolvedStartElement,
        getEndElement: () => resolvedEndElement,
        getItemsElement: () => resolvedItemsElement,
        getScrollableParent: () => scrollableParent,
        // Callbacks
        onBeforePreviousRequest: () => setLoadingPrevious(true),
        onBeforeNextRequest: () => setLoadingNext(true),
        onCompletePreviousRequest: ({ completed }) => {
          setLoadingPrevious(false);
          if (completed) {
            syncStateFromDataManager();
          }
        },
        onCompleteNextRequest: ({ completed }) => {
          setLoadingNext(false);
          if (completed) {
            syncStateFromDataManager();
          }
        },
        onDataReset: syncStateFromDataManager
      });
      setInfiniteScroll(infiniteScrollInstance);
      const { dataManager: dataManager2, elementManager: elementManager2 } = infiniteScrollInstance;
      syncStateFromDataManager();
      elementManager2.setupObservers();
      elementManager2.processServerLoadedElements(dataManager2.getLastLoadedPage());
      if (autoLoad) {
        elementManager2.enableTriggers();
      }
      return () => {
        infiniteScrollInstance.flush();
        setInfiniteScroll(null);
      };
    }, [data, resolvedItemsElement, resolvedStartElement, resolvedEndElement, scrollableParent]);
    const manualMode = useMemo6(
      () => manual || manualAfter > 0 && requestCount >= manualAfter,
      [manual, manualAfter, requestCount]
    );
    const autoLoad = useMemo6(() => !manualMode, [manualMode]);
    useEffect7(() => {
      autoLoad ? elementManager?.enableTriggers() : elementManager?.disableTriggers();
    }, [autoLoad, onlyNext, onlyPrevious, resolvedStartElement, resolvedEndElement]);
    useEffect7(() => {
      const shouldAutoScroll = autoScroll !== void 0 ? autoScroll : reverse;
      if (shouldAutoScroll) {
        scrollToBottom();
      }
    }, [scrollableParent]);
    useImperativeHandle2(
      ref,
      () => ({
        fetchNext: dataManager?.fetchNext || (() => {
        }),
        fetchPrevious: dataManager?.fetchPrevious || (() => {
        }),
        hasPrevious: dataManager?.hasPrevious || (() => false),
        hasNext: dataManager?.hasNext || (() => false)
      }),
      [dataManager]
    );
    const headerAutoMode = autoLoad && !onlyNext;
    const footerAutoMode = autoLoad && !onlyPrevious;
    const sharedExposed = {
      loadingPrevious,
      loadingNext,
      hasPrevious: hasPreviousPage,
      hasNext: hasNextPage
    };
    const exposedPrevious = {
      loading: loadingPrevious,
      fetch: dataManager?.fetchPrevious ?? (() => {
      }),
      autoMode: headerAutoMode,
      manualMode: !headerAutoMode,
      hasMore: hasPreviousPage,
      ...sharedExposed
    };
    const exposedNext = {
      loading: loadingNext,
      fetch: dataManager?.fetchNext ?? (() => {
      }),
      autoMode: footerAutoMode,
      manualMode: !footerAutoMode,
      hasMore: hasNextPage,
      ...sharedExposed
    };
    const exposedSlot = {
      loading: loadingPrevious || loadingNext,
      loadingPrevious,
      loadingNext
    };
    const renderElements = [];
    if (!startElement) {
      renderElements.push(
        createElement4(
          "div",
          { ref: startElementRef },
          // Render previous slot or fallback to loading indicator
          renderSlot(previous, exposedPrevious, loadingPrevious ? renderSlot(loading, exposedPrevious) : null)
        )
      );
    }
    renderElements.push(
      createElement4(
        as,
        { ...props, ref: itemsElementRef },
        typeof children === "function" ? children(exposedSlot) : children
      )
    );
    if (!endElement) {
      renderElements.push(
        createElement4(
          "div",
          { ref: endElementRef },
          // Render next slot or fallback to loading indicator
          renderSlot(next, exposedNext, loadingNext ? renderSlot(loading, exposedNext) : null)
        )
      );
    }
    return createElement4(React3.Fragment, {}, ...reverse ? [...renderElements].reverse() : renderElements);
  }
);
InfiniteScroll.displayName = "InertiaInfiniteScroll";
var InfiniteScroll_default = InfiniteScroll;

// src/Link.ts
import {
  isUrlMethodPair as isUrlMethodPair2,
  mergeDataIntoQueryString as mergeDataIntoQueryString2,
  resolveUrlMethodPairComponent as resolveUrlMethodPairComponent2,
  router as router6,
  shouldIntercept,
  shouldNavigate
} from "@inertiajs/core";
import { createElement as createElement5, forwardRef as forwardRef3, useEffect as useEffect8, useMemo as useMemo7, useRef as useRef7, useState as useState7 } from "react";
var noop2 = () => void 0;
var Link = forwardRef3(
  ({
    children,
    as = "a",
    data = {},
    href = "",
    method = "get",
    preserveScroll = false,
    preserveState = null,
    preserveUrl = false,
    replace = false,
    only = [],
    except = [],
    headers = {},
    queryStringArrayFormat = "brackets",
    async = false,
    onClick = noop2,
    onCancelToken = noop2,
    onBefore = noop2,
    onStart = noop2,
    onProgress = noop2,
    onFinish = noop2,
    onCancel = noop2,
    onSuccess = noop2,
    onError = noop2,
    onPrefetching = noop2,
    onPrefetched = noop2,
    prefetch = false,
    cacheFor = 0,
    cacheTags = [],
    viewTransition = false,
    component = null,
    instant = false,
    pageProps = null,
    ...props
  }, ref) => {
    const [inFlightCount, setInFlightCount] = useState7(0);
    const hoverTimeout = useRef7(void 0);
    const _method = useMemo7(() => {
      return isUrlMethodPair2(href) ? href.method : method.toLowerCase();
    }, [href, method]);
    const resolvedComponent = useMemo7(() => {
      if (component) {
        return component;
      }
      if (instant && isUrlMethodPair2(href)) {
        return resolveUrlMethodPairComponent2(href);
      }
      return null;
    }, [component, instant, href]);
    const _as = useMemo7(() => {
      if (typeof as !== "string" || as.toLowerCase() !== "a") {
        return as;
      }
      return _method !== "get" ? "button" : as.toLowerCase();
    }, [as, _method]);
    const mergeDataArray = useMemo7(
      () => mergeDataIntoQueryString2(_method, isUrlMethodPair2(href) ? href.url : href, data, queryStringArrayFormat),
      [href, _method, data, queryStringArrayFormat]
    );
    const url = useMemo7(() => mergeDataArray[0], [mergeDataArray]);
    const _data = useMemo7(() => mergeDataArray[1], [mergeDataArray]);
    const baseParams = useMemo7(
      () => ({
        data: _data,
        method: _method,
        preserveScroll,
        preserveState: preserveState ?? _method !== "get",
        preserveUrl,
        replace,
        only,
        except,
        headers,
        async,
        component: resolvedComponent,
        pageProps
      }),
      [
        _data,
        _method,
        preserveScroll,
        preserveState,
        preserveUrl,
        replace,
        only,
        except,
        headers,
        async,
        resolvedComponent,
        pageProps
      ]
    );
    const visitParams = useMemo7(
      () => ({
        ...baseParams,
        viewTransition,
        onCancelToken,
        onBefore,
        onStart(visit) {
          setInFlightCount((count) => count + 1);
          onStart(visit);
        },
        onProgress,
        onFinish(visit) {
          setInFlightCount((count) => count - 1);
          onFinish(visit);
        },
        onCancel,
        onSuccess,
        onError
      }),
      [
        baseParams,
        viewTransition,
        onCancelToken,
        onBefore,
        onStart,
        onProgress,
        onFinish,
        onCancel,
        onSuccess,
        onError
      ]
    );
    const prefetchModes = useMemo7(
      () => {
        if (prefetch === true) {
          return ["hover"];
        }
        if (prefetch === false) {
          return [];
        }
        if (Array.isArray(prefetch)) {
          return prefetch;
        }
        return [prefetch];
      },
      Array.isArray(prefetch) ? prefetch : [prefetch]
    );
    const cacheForValue = useMemo7(() => {
      if (cacheFor !== 0) {
        return cacheFor;
      }
      if (prefetchModes.length === 1 && prefetchModes[0] === "click") {
        return 0;
      }
      return config.get("prefetch.cacheFor");
    }, [cacheFor, prefetchModes]);
    const doPrefetch = useMemo7(() => {
      return () => {
        router6.prefetch(
          url,
          {
            ...baseParams,
            onPrefetching,
            onPrefetched
          },
          { cacheFor: cacheForValue, cacheTags }
        );
      };
    }, [url, baseParams, onPrefetching, onPrefetched, cacheForValue, cacheTags]);
    useEffect8(() => {
      return () => {
        clearTimeout(hoverTimeout.current);
      };
    }, []);
    useEffect8(() => {
      if (prefetchModes.includes("mount")) {
        setTimeout(() => doPrefetch());
      }
    }, prefetchModes);
    const regularEvents = {
      onClick: (event) => {
        onClick(event);
        if (shouldIntercept(event)) {
          event.preventDefault();
          router6.visit(url, visitParams);
        }
      }
    };
    const prefetchHoverEvents = {
      onMouseEnter: () => {
        hoverTimeout.current = window.setTimeout(() => {
          doPrefetch();
        }, config.get("prefetch.hoverDelay"));
      },
      onMouseLeave: () => {
        clearTimeout(hoverTimeout.current);
      },
      onClick: (event) => {
        clearTimeout(hoverTimeout.current);
        regularEvents.onClick(event);
      }
    };
    const prefetchClickEvents = {
      onMouseDown: (event) => {
        if (shouldIntercept(event)) {
          event.preventDefault();
          doPrefetch();
        }
      },
      onKeyDown: (event) => {
        if (shouldNavigate(event)) {
          event.preventDefault();
          doPrefetch();
        }
      },
      onMouseUp: (event) => {
        if (shouldIntercept(event)) {
          event.preventDefault();
          router6.visit(url, visitParams);
        }
      },
      onKeyUp: (event) => {
        if (shouldNavigate(event)) {
          event.preventDefault();
          router6.visit(url, visitParams);
        }
      },
      onClick: (event) => {
        onClick(event);
        if (shouldIntercept(event)) {
          event.preventDefault();
        }
      }
    };
    const elProps = useMemo7(() => {
      if (_as === "button") {
        return { type: "button" };
      }
      if (_as === "a" || typeof _as !== "string") {
        return { href: url };
      }
      return {};
    }, [_as, url]);
    return createElement5(
      _as,
      {
        ...props,
        ...elProps,
        ref,
        ...(() => {
          if (prefetchModes.includes("hover")) {
            return prefetchHoverEvents;
          }
          if (prefetchModes.includes("click")) {
            return prefetchClickEvents;
          }
          return regularEvents;
        })(),
        "data-loading": inFlightCount > 0 ? "" : void 0
      },
      children
    );
  }
);
Link.displayName = "InertiaLink";
var Link_default = Link;

// src/useHttp.ts
import {
  hasFiles,
  http,
  HttpCancelledError,
  HttpResponseError,
  mergeDataIntoQueryString as mergeDataIntoQueryString3,
  objectToFormData,
  UseFormUtils as UseFormUtils4
} from "@inertiajs/core";
import { cloneDeep as cloneDeep3 } from "es-toolkit";
import { toSimpleValidationErrors as toSimpleValidationErrors2 } from "laravel-precognition";
import { useCallback as useCallback4, useMemo as useMemo8, useRef as useRef8, useState as useState8 } from "react";
function useHttp(...args) {
  const { rememberKey, data, precognitionEndpoint } = UseFormUtils4.parseUseFormArguments(...args);
  const initialDefaults = typeof data === "function" ? cloneDeep3(data()) : cloneDeep3(data);
  const abortController = useRef8(null);
  const excludeKeysRef = useRef8([]);
  const pendingOptimisticRef = useRef8(null);
  const [response, setResponse] = useState8(null);
  const useDataState = rememberKey ? () => useRemember(initialDefaults, `${rememberKey}:data`, excludeKeysRef) : void 0;
  const useErrorsState = rememberKey ? () => useRemember({}, `${rememberKey}:errors`) : void 0;
  const {
    form: baseForm,
    setDefaultsState,
    transformRef,
    dataRef,
    precognitionEndpointRef,
    isMounted,
    setProcessing,
    setProgress,
    markAsSuccessful,
    clearErrors,
    setError,
    defaultsCalledInOnSuccessRef,
    resetBeforeSubmit,
    finishProcessing,
    withAllErrors
  } = useFormState({
    data,
    precognitionEndpoint,
    useDataState,
    useErrorsState
  });
  const submit = useCallback4(
    async (method, url, options) => {
      const onBefore = options.onBefore?.();
      if (onBefore === false) {
        return Promise.reject(new Error("Request cancelled by onBefore"));
      }
      defaultsCalledInOnSuccessRef.current = false;
      if (isMounted.current) {
        resetBeforeSubmit();
      }
      abortController.current = new AbortController();
      const cancelToken = {
        cancel: () => abortController.current?.abort()
      };
      options.onCancelToken?.(cancelToken);
      options.optimistic = options.optimistic ?? pendingOptimisticRef.current ?? void 0;
      pendingOptimisticRef.current = null;
      let snapshot;
      if (options.optimistic) {
        snapshot = cloneDeep3(dataRef.current);
        const optimisticData = options.optimistic(cloneDeep3(snapshot));
        baseForm.setData((current) => ({ ...current, ...optimisticData }));
      }
      if (isMounted.current) {
        setProcessing(true);
      }
      options.onStart?.();
      const transformedData = transformRef.current(dataRef.current);
      const useFormData = hasFiles(transformedData);
      let requestUrl = url;
      let requestData;
      let contentType;
      if (method === "get") {
        const [urlWithParams] = mergeDataIntoQueryString3(
          method,
          url,
          transformedData
        );
        requestUrl = urlWithParams;
      } else {
        if (useFormData) {
          requestData = objectToFormData(transformedData);
        } else {
          requestData = JSON.stringify(transformedData);
          contentType = "application/json";
        }
      }
      try {
        const httpResponse = await http.getClient().request({
          method,
          url: requestUrl,
          data: requestData,
          headers: {
            Accept: "application/json",
            ...contentType ? { "Content-Type": contentType } : {},
            ...options.headers
          },
          signal: abortController.current.signal,
          onUploadProgress: (event) => {
            if (isMounted.current) {
              setProgress(event);
            }
            options.onProgress?.(event);
          }
        });
        const responseData = httpResponse.data ? JSON.parse(httpResponse.data) : null;
        if (httpResponse.status >= 200 && httpResponse.status < 300) {
          if (isMounted.current) {
            markAsSuccessful();
            setResponse(responseData);
          }
          options.onSuccess?.(responseData, httpResponse);
          if (isMounted.current && !defaultsCalledInOnSuccessRef.current) {
            baseForm.setData((data2) => {
              setDefaultsState(cloneDeep3(data2));
              return data2;
            });
          }
          return responseData;
        }
        throw new HttpResponseError(`Request failed with status ${httpResponse.status}`, httpResponse);
      } catch (error) {
        if (snapshot && isMounted.current) {
          baseForm.setData(snapshot);
        }
        if (error instanceof HttpResponseError) {
          if (error.response.status === 422) {
            const responseData = JSON.parse(error.response.data);
            const validationErrors = responseData.errors || {};
            const processedErrors = withAllErrors.enabled() ? validationErrors : toSimpleValidationErrors2(validationErrors);
            if (isMounted.current) {
              clearErrors();
              setError(processedErrors);
            }
            options.onError?.(processedErrors);
            return void 0;
          }
          options.onHttpException?.(error.response);
          throw error;
        }
        if (error instanceof HttpCancelledError || error instanceof Error && error.name === "AbortError") {
          options.onCancel?.();
          throw new HttpCancelledError("Request was cancelled", url);
        }
        options.onNetworkError?.(error instanceof Error ? error : new Error("Unknown error"));
        throw error;
      } finally {
        if (isMounted.current) {
          finishProcessing();
        }
        abortController.current = null;
        options.onFinish?.();
      }
    },
    [clearErrors, setError]
  );
  const cancel = useCallback4(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);
  const submitWithArgs = useCallback4(
    (...args2) => {
      const parsed = UseFormUtils4.parseSubmitArguments(args2, precognitionEndpointRef.current);
      return submit(parsed.method, parsed.url, parsed.options);
    },
    [submit]
  );
  const submitMethods = useMemo8(
    () => ({
      get: async (url, options = {}) => submit("get", url, options),
      post: async (url, options = {}) => submit("post", url, options),
      put: async (url, options = {}) => submit("put", url, options),
      patch: async (url, options = {}) => submit("patch", url, options),
      delete: async (url, options = {}) => submit("delete", url, options)
    }),
    [submit]
  );
  Object.assign(baseForm, {
    response,
    submit: submitWithArgs,
    ...submitMethods,
    cancel,
    dontRemember: (...keys) => {
      excludeKeysRef.current = keys;
      return form;
    },
    optimistic: (callback) => {
      pendingOptimisticRef.current = callback;
      return form;
    },
    withAllErrors: () => {
      withAllErrors.enable();
      return form;
    }
  });
  const form = baseForm;
  const originalWithPrecognition = baseForm.withPrecognition;
  form.withPrecognition = (...args2) => {
    originalWithPrecognition(...args2);
    return form;
  };
  return precognitionEndpointRef.current ? form : form;
}

// src/usePoll.ts
import { router as router7 } from "@inertiajs/core";
import { useCallback as useCallback5, useEffect as useEffect9, useRef as useRef9, useState as useState9 } from "react";
function usePoll(interval, requestOptions = {}, options = {
  keepAlive: false,
  autoStart: true
}) {
  const latest = useRef9(requestOptions);
  latest.current = requestOptions;
  const pollRef = useRef9(null);
  const [polling, setPolling] = useState9(options.autoStart ?? true);
  useEffect9(() => {
    pollRef.current = router7.poll(
      interval,
      typeof requestOptions === "function" ? () => latest.current() : requestOptions,
      { ...options, autoStart: options.autoStart ?? true }
    );
    return () => pollRef.current?.destroy();
  }, []);
  const stop = useCallback5(() => {
    pollRef.current?.stop();
    setPolling(false);
  }, []);
  const start = useCallback5(() => {
    pollRef.current?.start();
    setPolling(true);
  }, []);
  return {
    stop,
    start,
    polling
  };
}

// src/usePrefetch.ts
import { router as router8 } from "@inertiajs/core";
import { useEffect as useEffect10, useState as useState10 } from "react";
function usePrefetch(options = {}) {
  const cached = typeof window === "undefined" ? null : router8.getCached(window.location.pathname, options);
  const inFlight = typeof window === "undefined" ? null : router8.getPrefetching(window.location.pathname, options);
  const [lastUpdatedAt, setLastUpdatedAt] = useState10(cached?.staleTimestamp || null);
  const [isPrefetching, setIsPrefetching] = useState10(inFlight !== null);
  const [isPrefetched, setIsPrefetched] = useState10(cached !== null);
  useEffect10(() => {
    const onPrefetchingListener = router8.on("prefetching", (e) => {
      if (e.detail.visit.url.pathname === window.location.pathname) {
        setIsPrefetching(true);
      }
    });
    const onPrefetchedListener = router8.on("prefetched", (e) => {
      if (e.detail.visit.url.pathname === window.location.pathname) {
        setIsPrefetching(false);
        setIsPrefetched(true);
        setLastUpdatedAt(e.detail.fetchedAt);
      }
    });
    return () => {
      onPrefetchedListener();
      onPrefetchingListener();
    };
  }, []);
  return {
    lastUpdatedAt,
    isPrefetching,
    isPrefetched,
    flush: () => router8.flush(window.location.pathname, options)
  };
}

// src/WhenVisible.ts
import { router as router9 } from "@inertiajs/core";
import { get as get3 } from "es-toolkit/compat";
import { createElement as createElement6, useCallback as useCallback6, useEffect as useEffect11, useMemo as useMemo9, useRef as useRef10, useState as useState11 } from "react";
var WhenVisible = ({ children, data, params, buffer, as, always, fallback }) => {
  always = always ?? false;
  as = as ?? "div";
  fallback = fallback ?? null;
  const pageProps = usePage().props;
  const keys = useMemo9(() => data ? Array.isArray(data) ? data : [data] : [], [data]);
  const [loaded, setLoaded] = useState11(() => keys.length > 0 && keys.every((key) => get3(pageProps, key) !== void 0));
  const [isFetching, setIsFetching] = useState11(false);
  const fetching = useRef10(false);
  const ref = useRef10(null);
  const observer = useRef10(null);
  const getReloadParamsRef = useRef10(() => ({}));
  useEffect11(() => {
    if (keys.length > 0) {
      setLoaded(keys.every((key) => get3(pageProps, key) !== void 0));
    }
  }, [pageProps, keys]);
  const getReloadParams = useCallback6(() => {
    const reloadParams = { preserveErrors: true, ...params };
    if (data) {
      reloadParams.only = Array.isArray(data) ? data : [data];
    }
    return reloadParams;
  }, [params, data]);
  getReloadParamsRef.current = getReloadParams;
  const registerObserver = () => {
    observer.current?.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          return;
        }
        if (fetching.current) {
          return;
        }
        if (!always && loaded) {
          return;
        }
        fetching.current = true;
        setIsFetching(true);
        const reloadParams = getReloadParamsRef.current();
        router9.reload({
          ...reloadParams,
          onStart: (e) => {
            fetching.current = true;
            setIsFetching(true);
            reloadParams.onStart?.(e);
          },
          onFinish: (e) => {
            setLoaded(true);
            fetching.current = false;
            setIsFetching(false);
            reloadParams.onFinish?.(e);
            if (!always) {
              observer.current?.disconnect();
            }
          }
        });
      },
      {
        rootMargin: `${buffer || 0}px`
      }
    );
    observer.current.observe(ref.current);
  };
  useEffect11(() => {
    if (!ref.current) {
      return;
    }
    if (loaded && !always) {
      return;
    }
    registerObserver();
    return () => {
      observer.current?.disconnect();
    };
  }, [always, loaded, buffer]);
  const resolveChildren = () => typeof children === "function" ? children({ fetching: isFetching }) : children;
  const resolveFallback = () => typeof fallback === "function" ? fallback() : fallback;
  if (always || !loaded) {
    return createElement6(
      as,
      {
        props: null,
        ref
      },
      loaded ? resolveChildren() : resolveFallback()
    );
  }
  return loaded ? resolveChildren() : null;
};
WhenVisible.displayName = "InertiaWhenVisible";
var WhenVisible_default = WhenVisible;

// src/index.ts
var config = coreConfig.extend();
export {
  App,
  Deferred_default as Deferred,
  Form_default as Form,
  Head_default as Head,
  InfiniteScroll_default as InfiniteScroll,
  Link_default as Link,
  WhenVisible_default as WhenVisible,
  config,
  createInertiaApp,
  http2 as http,
  progress,
  resetLayoutProps,
  router3 as router,
  setLayoutProps,
  useForm,
  useFormContext,
  useHttp,
  usePage,
  usePoll,
  usePrefetch,
  useRemember
};
//# sourceMappingURL=index.js.map
