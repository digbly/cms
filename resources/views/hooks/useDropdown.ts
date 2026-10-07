import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

const MENU_ITEM_SELECTOR = '[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"]';

interface DropdownResult {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
    containerRef: RefObject<HTMLDivElement | null>;
    triggerRef: RefObject<HTMLButtonElement | null>;
    menuRef: RefObject<HTMLDivElement | null>;
    onMenuKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * Behaviour for a menu-button dropdown: outside-click and Escape dismissal,
 * focus moves to the first item on open, and arrow/Home/End navigation inside
 * the menu.
 */
export function useDropdown(): DropdownResult {
    const [open, setOpenState] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const setOpen = useCallback((next: boolean) => setOpenState(next), []);
    const toggle = useCallback(() => setOpenState((previous) => !previous), []);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onPointerDown = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpenState(false);
            }
        };
        const onKey = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenState(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        menuRef.current?.querySelector<HTMLElement>(MENU_ITEM_SELECTOR)?.focus();
    }, [open]);

    const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            setOpenState(false);
            triggerRef.current?.focus();

            return;
        }

        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            return;
        }

        const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? []);

        if (items.length === 0) {
            return;
        }

        event.preventDefault();

        const currentIndex = items.indexOf(document.activeElement as HTMLElement);
        let nextIndex = 0;

        if (event.key === 'ArrowDown') {
            nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
        } else if (event.key === 'ArrowUp') {
            nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        } else if (event.key === 'End') {
            nextIndex = items.length - 1;
        }

        items[nextIndex]?.focus();
    };

    return { open, setOpen, toggle, containerRef, triggerRef, menuRef, onMenuKeyDown };
}
