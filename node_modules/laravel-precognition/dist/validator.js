import { isEqual } from 'es-toolkit';
import { debounce, get, set, merge } from 'es-toolkit/compat';
import { HttpResponseError, HttpCancelledError } from './http/errors.js';
import { isFile } from './form.js';
import { client } from './client.js';
/**
 * Expand a wildcard path to concrete paths using the given data.
 *
 * Examples:
 * - 'users.*' with {users: [{name: 'A'}, {name: 'B'}]} => ['users.0', 'users.1']
 * - 'users.*.name' with {users: [{name: 'A'}, {name: 'B'}]} => ['users.0.name', 'users.1.name']
 * - 'author.*' with {author: {name: 'John', bio: 'Dev'}} => ['author.name', 'author.bio']
 */
export const expandWildcardPaths = (pattern, data) => {
    if (!pattern.includes('*')) {
        return [pattern];
    }
    const parts = pattern.split('.');
    let paths = [''];
    for (const part of parts) {
        if (part === '*') {
            const expanded = [];
            for (const path of paths) {
                const value = path ? get(data, path) : data;
                if (Array.isArray(value)) {
                    // Expand array indices...
                    for (let index = 0; index < value.length; index++) {
                        expanded.push(path ? `${path}.${index}` : String(index));
                    }
                }
                else if (value !== null && typeof value === 'object') {
                    // Expand object keys...
                    for (const key of Object.keys(value)) {
                        expanded.push(path ? `${path}.${key}` : key);
                    }
                }
                // If value is null, undefined, or primitive, wildcard matches nothing.
                // e.g., 'users.*' with {users: null} => []
            }
            paths = expanded;
        }
        else {
            // Append the literal part to all current paths
            paths = paths.map((path) => path ? `${path}.${part}` : part);
        }
    }
    return paths;
};
/**
 * Determine if a key matches the given pattern.
 */
const keyMatchesPattern = (key, pattern) => {
    if (!pattern.includes('*')) {
        return key === pattern;
    }
    const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '[^.]+') + '$');
    return regex.test(key);
};
/**
 * Omit entries from an object whose keys match the given patterns.
 */
const omitByPattern = (obj, patterns) => {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => {
        return !patterns.some((pattern) => keyMatchesPattern(key, pattern));
    }));
};
export const createValidator = (callback, initialData = {}) => {
    /**
     * Event listener state.
     */
    const listeners = {
        errorsChanged: [],
        touchedChanged: [],
        validatingChanged: [],
        validatedChanged: [],
    };
    /**
     * Validate files state.
     */
    let validateFiles = false;
    /**
     * Processing validation state.
     */
    let validating = false;
    /**
     * Set the validating inputs.
     *
     * Returns an array of listeners that should be invoked once all state
     * changes have taken place.
     */
    const setValidating = (value) => {
        if (value !== validating) {
            validating = value;
            return listeners.validatingChanged;
        }
        return [];
    };
    /**
     * Inputs that have been validated.
     */
    let validated = [];
    /**
     * Set the validated inputs.
     *
     * Returns an array of listeners that should be invoked once all state
     * changes have taken place.
     */
    const setValidated = (value) => {
        const uniqueNames = [...new Set(value)];
        if (validated.length !== uniqueNames.length || !uniqueNames.every((name) => validated.includes(name))) {
            validated = uniqueNames;
            return listeners.validatedChanged;
        }
        return [];
    };
    /**
     * Valid validation state.
     */
    const valid = () => validated.filter((name) => typeof errors[name] === 'undefined');
    /**
     * Touched input state.
     */
    let touched = [];
    /**
     * Set the touched inputs.
     *
     * Returns an array of listeners that should be invoked once all state
     * changes have taken place.
     */
    const setTouched = (value) => {
        const uniqueNames = [...new Set(value)];
        if (touched.length !== uniqueNames.length || !uniqueNames.every((name) => touched.includes(name))) {
            touched = uniqueNames;
            return listeners.touchedChanged;
        }
        return [];
    };
    /**
     * Validation errors state.
     */
    let errors = {};
    /**
     * Set the input errors.
     *
     * Returns an array of listeners that should be invoked once all state
     * changes have taken place.
     */
    const setErrors = (value) => {
        const prepared = toValidationErrors(value);
        if (!isEqual(errors, prepared)) {
            errors = prepared;
            return listeners.errorsChanged;
        }
        return [];
    };
    /**
     * Forget the given input's errors.
     *
     * Returns an array of listeners that should be invoked once all state
     * changes have taken place.
     */
    const forgetError = (name) => {
        const newErrors = { ...errors };
        delete newErrors[resolveName(name)];
        return setErrors(newErrors);
    };
    /**
     * Has errors state.
     */
    const hasErrors = () => Object.keys(errors).length > 0;
    /**
     * Debouncing timeout state.
     */
    let debounceTimeoutDuration = 1500;
    const setDebounceTimeout = (value) => {
        debounceTimeoutDuration = value;
        validator.cancel();
        validator = createValidator();
    };
    /**
     * The old data.
     */
    let oldData = initialData;
    /**
     * The data currently being validated.
     */
    let validatingData = null;
    /**
     * The old touched.
     */
    let oldTouched = [];
    /**
     * The touched currently being validated.
     */
    let validatingTouched = null;
    /**
     * Create a debounced validation callback.
     */
    const createValidator = () => debounce((instanceConfig) => {
        callback({
            get: (url, data = {}, globalConfig = {}) => client.get(url, parseData(data), resolveConfig(globalConfig, instanceConfig, data)),
            post: (url, data = {}, globalConfig = {}) => client.post(url, parseData(data), resolveConfig(globalConfig, instanceConfig, data)),
            patch: (url, data = {}, globalConfig = {}) => client.patch(url, parseData(data), resolveConfig(globalConfig, instanceConfig, data)),
            put: (url, data = {}, globalConfig = {}) => client.put(url, parseData(data), resolveConfig(globalConfig, instanceConfig, data)),
            delete: (url, data = {}, globalConfig = {}) => client.delete(url, parseData(data), resolveConfig(globalConfig, instanceConfig, data)),
        }).catch((error) => {
            // Precognition can often cancel in-flight requests. Instead of
            // throwing an exception for this expected behaviour, we silently
            // discard cancelled request errors to not flood the console with
            // expected errors.
            if (error instanceof HttpCancelledError) {
                return null;
            }
            // Unlike other status codes, 422 responses are expected and
            // regularly occur with Precognition requests. We silently ignore
            // these so we do not flood the console with expected errors. If
            // needed, they can be intercepted by the `onValidationError`
            // config option instead.
            if (error instanceof HttpResponseError && error.response?.status === 422) {
                return null;
            }
            return Promise.reject(error);
        });
    }, debounceTimeoutDuration, { leading: true, trailing: true });
    /**
     * Validator state.
     */
    let validator = createValidator();
    /**
     * Resolve the configuration.
     */
    const resolveConfig = (globalConfig, instanceConfig, data = {}) => {
        const config = {
            ...globalConfig,
            ...instanceConfig,
        };
        const only = Array.from(config.only ?? config.validate ?? touched);
        return {
            ...instanceConfig,
            ...merge({}, globalConfig, instanceConfig),
            only,
            timeout: config.timeout ?? 5000,
            onValidationError: (response, error) => {
                [
                    ...setValidated([...validated, ...only]),
                    ...setErrors(merge(omitByPattern({ ...errors }, only), response.data.errors)),
                ].forEach((listener) => listener());
                return config.onValidationError
                    ? config.onValidationError(response, error)
                    : Promise.reject(error);
            },
            onSuccess: (response) => {
                setValidated([...validated, ...only]).forEach((listener) => listener());
                return config.onSuccess
                    ? config.onSuccess(response)
                    : response;
            },
            onPrecognitionSuccess: (response) => {
                [
                    ...setValidated([...validated, ...only]),
                    ...setErrors(omitByPattern({ ...errors }, only)),
                ].forEach((listener) => listener());
                return config.onPrecognitionSuccess
                    ? config.onPrecognitionSuccess(response)
                    : response;
            },
            onBefore: () => {
                // Wildcards are expanded to concrete paths using the current
                // form data so that each field is individually tracked.
                const hasWildcards = touched.some((name) => name.includes('*'));
                const expandedTouched = hasWildcards
                    ? [...new Set(touched.flatMap((name) => expandWildcardPaths(name, data)))]
                    : touched;
                if (config.onBeforeValidation && config.onBeforeValidation({ data, touched: expandedTouched }, { data: oldData, touched: oldTouched }) === false) {
                    return false;
                }
                const beforeResult = (config.onBefore || (() => true))();
                if (beforeResult === false) {
                    return false;
                }
                if (hasWildcards) {
                    setTouched(expandedTouched).forEach((listener) => listener());
                }
                validatingTouched = touched;
                validatingData = data;
                return true;
            },
            onStart: () => {
                setValidating(true).forEach((listener) => listener());
                (config.onStart ?? (() => null))();
            },
            onFinish: () => {
                setValidating(false).forEach((listener) => listener());
                oldTouched = validatingTouched;
                oldData = validatingData;
                validatingTouched = validatingData = null;
                (config.onFinish ?? (() => null))();
            },
        };
    };
    /**
     * Validate the given input.
     */
    const validate = (name, value, config) => {
        if (typeof name === 'undefined') {
            const only = Array.from(config?.only ?? config?.validate ?? []);
            setTouched([...touched, ...only]).forEach((listener) => listener());
            validator(config ?? {});
            return;
        }
        if (isFile(value) && !validateFiles) {
            console.warn('Precognition file validation is not active. Call the "validateFiles" function on your form to enable it.');
            return;
        }
        name = resolveName(name);
        if (name.includes('*') || get(oldData, name) !== value) {
            setTouched([name, ...touched]).forEach((listener) => listener());
            validator(config ?? {});
        }
    };
    /**
     * Parse the validated data.
     */
    const parseData = (data) => validateFiles === false
        ? forgetFiles(data)
        : data;
    /**
     * The form validator instance.
     */
    const form = {
        touched: () => touched,
        validate(name, value, config) {
            if (typeof name === 'object' && !('target' in name)) {
                config = name;
                name = value = undefined;
            }
            validate(name, value, config);
            return form;
        },
        touch(input) {
            const inputs = Array.isArray(input)
                ? input
                : [resolveName(input)];
            setTouched([...touched, ...inputs]).forEach((listener) => listener());
            return form;
        },
        validating: () => validating,
        valid,
        errors: () => errors,
        hasErrors,
        setErrors(value) {
            setErrors(value).forEach((listener) => listener());
            return form;
        },
        forgetError(name) {
            forgetError(name).forEach((listener) => listener());
            return form;
        },
        defaults(data) {
            initialData = data;
            oldData = data;
            return form;
        },
        reset(...names) {
            if (names.length === 0) {
                setTouched([]).forEach((listener) => listener());
            }
            else {
                const newTouched = [...touched];
                names.forEach((name) => {
                    if (newTouched.includes(name)) {
                        newTouched.splice(newTouched.indexOf(name), 1);
                    }
                    set(oldData, name, get(initialData, name));
                });
                setTouched(newTouched).forEach((listener) => listener());
            }
            return form;
        },
        setTimeout(value) {
            setDebounceTimeout(value);
            return form;
        },
        on(event, callback) {
            listeners[event].push(callback);
            return form;
        },
        validateFiles() {
            validateFiles = true;
            return form;
        },
        withoutFileValidation() {
            validateFiles = false;
            return form;
        },
    };
    return form;
};
/**
 * Normalise the validation errors as Inertia formatted errors.
 */
export const toSimpleValidationErrors = (errors) => {
    return Object.keys(errors).reduce((carry, key) => ({
        ...carry,
        [key]: Array.isArray(errors[key])
            ? errors[key][0]
            : errors[key],
    }), {});
};
/**
 * Normalise the validation errors as Laravel formatted errors.
 */
export const toValidationErrors = (errors) => {
    return Object.keys(errors).reduce((carry, key) => ({
        ...carry,
        [key]: typeof errors[key] === 'string' ? [errors[key]] : errors[key],
    }), {});
};
/**
 * Resolve the input's "name" attribute.
 */
export const resolveName = (name) => {
    return typeof name !== 'string'
        ? name.target.name
        : name;
};
/**
 * Forget any files from the payload.
 */
const forgetFiles = (data) => {
    const newData = { ...data };
    Object.keys(newData).forEach((name) => {
        const value = newData[name];
        if (value === null) {
            return;
        }
        if (isFile(value)) {
            delete newData[name];
            return;
        }
        if (Array.isArray(value)) {
            newData[name] = Object.values(forgetFiles({ ...value }));
            return;
        }
        if (typeof value === 'object') {
            // @ts-expect-error
            newData[name] = forgetFiles(newData[name]);
            return;
        }
    });
    return newData;
};
