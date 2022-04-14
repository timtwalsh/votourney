import React from "react";

export default function useBouncer(fn, delay = 0) {
    const ref = React.useRef({ id: 0 });
    ref.current.fn = fn;
    const bouncer = React.useCallback(
        (...args) => {
            ref.current.promise = new Promise((resolve, reject) => {
                ref.current.resolve = resolve;
                ref.current.reject = reject;
            });
            if (ref.current.timeout) {
                clearTimeout(ref.current.timeout);
            }

            ref.current.timeout = setTimeout(async () => {
                ref.current.timeout = undefined;
                const id = ref.current.id + 1;
                ref.current.id = id;
                const checkLatest = () => id === ref.current.id;

                try {
                    const response = await ref.current.fn(...args);
                    if (checkLatest()) ref.current.resolve(response);
                } catch (err) {
                    if (checkLatest()) ref.current.reject(err);
                }
            }, delay);
            return ref.current.promise;
        },
        [delay]
    );
    return bouncer;
}