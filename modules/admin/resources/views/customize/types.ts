/**
 * Types for the admin customizer, matching the API payloads built by
 * `Modules\Admin\Support\CustomizeCatalog`.
 */

import type { SidebarDefinition, SidebarWidgetItem, WidgetDefinition } from '../widgets/types';

export interface CustomizeControlDefinition {
    key: string;
    label: string;
    section: string;
    settings: string;
    type: 'site_identity' | 'text' | 'textarea' | 'image' | 'select' | 'homepage' | 'widgets';
    options?: Record<string, string>;
    is_theme?: boolean;
}

export interface CustomizeSectionDefinition {
    key: string;
    title: string;
    priority?: number;
    panel?: string;
    controls?: Record<string, CustomizeControlDefinition> | CustomizeControlDefinition[];
}

export interface CustomizePanelDefinition {
    key: string;
    title: string;
    priority?: number;
    childs?: Record<string, CustomizeSectionDefinition> | CustomizeSectionDefinition[];
}

export type CustomizeItem = CustomizePanelDefinition | CustomizeSectionDefinition;

export interface PageBlockItem {
    id?: string | null;
    block: string;
    label: string;
    data: Record<string, unknown>;
}

export interface PageSummary {
    id: string;
    title: string;
    slug: string;
    template: string | null;
}

export interface PageTemplateDefinition {
    key: string;
    label: string;
    blocks: Record<string, string>;
}

export interface BlockDefinition {
    key: string;
    label: string;
}

export interface CustomizeWidgetData {
    widgets: WidgetDefinition[];
    sidebars: SidebarDefinition[];
    sidebarWidgets: Record<string, SidebarWidgetItem[]>;
}
