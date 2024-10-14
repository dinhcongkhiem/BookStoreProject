import { useEffect, useState, useCallback, useRef } from 'react';

function useDebounce(valueOrCallback, delay) {
    const timeoutRef = useRef(null);

    // If valueOrCallback is not a function, it's a value that we want to debounce
    const [debouncedValue, setDebouncedValue] = useState(
        typeof valueOrCallback === 'function' ? null : valueOrCallback
    );

    const debouncedFunction = useCallback((...args) => {
        if (typeof valueOrCallback === 'function') {
            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Set a new timeout for the function
            timeoutRef.current = setTimeout(() => {
                valueOrCallback(...args);
            }, delay);
        }
    }, [valueOrCallback, delay]);

    useEffect(() => {
        if (typeof valueOrCallback !== 'function') {
            const handler = setTimeout(() => setDebouncedValue(valueOrCallback), delay);
            return () => clearTimeout(handler);
        }
    }, [valueOrCallback, delay]);

    // Return the debounced function if it's a callback, or the debounced value if it's a value
    return typeof valueOrCallback === 'function' ? debouncedFunction : debouncedValue;
}

export default useDebounce;
