export interface AuthUser {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    is_super_admin: boolean;
    permissions: string[];
}

export interface NavItem {
    key: string;
    label: string;
    to: string | null;
    icon: string | null;
    permission: string | null;
    children: NavItem[];
}

export interface FlashMessages {
    success?: string | null;
    error?: string | null;
    warning?: string | null;
}

export interface SharedProps {
    [key: string]: unknown;
    auth: {
        user: AuthUser | null;
    };
    flash: FlashMessages;
    admin_menu: NavItem[];
    admin_prefix: string;
    locale: string;
    translations: Record<string, Record<string, unknown>>;
    routes: Record<string, string>;
    errors: Record<string, string>;
}
