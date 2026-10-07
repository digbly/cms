/**
 * Types for the admin menu manager, matching the API resources in
 * `Modules\Admin\Http\Resources\MenuResource` and `MenuItemResource`.
 */

export interface MenuItem {
    id: string;
    label: string;
    link?: string | null;
    target?: string | null;
    is_custom?: boolean;
    box_key?: string | null;
    menuable_id?: string | null;
    menuable_type?: string | null;
    menuable_class_name?: string | null;
    children: MenuItem[];
}

/** A menu item plus its flat-list nesting level, used by the drag builder. */
export interface FlatMenuItem extends MenuItem {
    depth: number;
}

export interface AdminMenu {
    id: string;
    name: string;
    items: MenuItem[];
}

/** A content source the builder can pull items from (e.g. blog posts). */
export interface MenuBox {
    key: string;
    label: string;
}

export interface MenuBoxItem {
    id: string;
    text: string;
    menuable_class?: string | null;
    menuable_class_name?: string | null;
}

export interface MenuLocation {
    key: string;
    label: string;
}

export interface MenuLocations {
    data: MenuLocation[];
    /** Map of location key to the id of the assigned menu. */
    selected: Record<string, string>;
}
