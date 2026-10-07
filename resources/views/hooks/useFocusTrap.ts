import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
    'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Trap keyboard focus inside a container while `active`, close on Escape, lock
 * body scroll, and restore focus to the previously focused element on release.
 */
export function useFocusTrap(
    active: boolean,
    containerRef: RefObject<HTMLElement | null>,
    onClose: () => void
): void {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!active) {
            return;
        }

        const container = containerRef.current;

        if (!container) {
            return;
        }

        const previouslyFocused = document.activeElement as HTMLElement | null;

        const focusableElements = () =>
            Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
                (element) => element.offsetParent !== null || element === document.activeElement
            );

        focusableElements()[0]?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onCloseRef.current();

                return;
            }

            if (event.key !== 'Tab') {
                return;
            }

            const items = focusableElements();

            if (items.length === 0) {
                event.preventDefault();

                return;
            }

            const first = items[0];
            const last = items[items.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus();
        };
    }, [active, containerRef]);
}
