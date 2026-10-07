/**
 * Types for the admin widget manager, matching the API resources in
 * `Modules\Admin\Http\Resources\{WidgetResource,SidebarResource,SidebarWidgetResource}`.
 */

export interface WidgetDefinition {
    key: string;
    label: string;
    description: string | null;
    /** Sidebar keys the widget may be attached to. Empty means any. */
    only: string[];
}

export interface SidebarDefinition {
    key: string;
    label: string;
    description: string | null;
}

export interface SidebarWidgetItem {
    id: string;
    widget: string;
    label: string;
    data: Record<string, unknown>;
    /** Client-only key used for drag and drop before the item is persisted. */
    _tempKey?: string;
}
