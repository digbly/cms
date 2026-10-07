export interface WidgetFormProps {
    /** Translatable widget heading shown on the frontend. */
    label: string;
    /** Widget settings stored on the sidebar entry. */
    data: Record<string, unknown>;
    onChange: (patch: { label?: string; data?: Record<string, unknown> }) => void;
}
