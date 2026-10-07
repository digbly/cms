export interface Category {
    id: string;
    name: string | null;
    slug: string | null;
    description?: string | null;
    posts_count?: number | null;
    url: string | null;
}

export interface NavItem {
    id: string;
    label: string | null;
    url: string | null;
    icon: string | null;
    target: string | null;
    children: NavItem[];
}

export interface Post {
    id: string;
    title: string | null;
    slug: string | null;
    description: string | null;
    content: string | null;
    views: number;
    author_name: string | null;
    created_at: string | null;
    url: string | null;
    categories: Category[];
}

export interface Comment {
    id: string;
    author_name: string;
    content: string;
    created_at: string | null;
    replies: Comment[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface Widget {
    key: string;
    label: string;
    component: string | null;
    data: Record<string, unknown>;
}

export interface Block {
    id: string;
    key: string;
    label: string;
    component: string | null;
    data: Record<string, unknown>;
}

export interface PageTemplate {
    key: string;
    label: string | null;
    blocks: Record<string, string>;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

export interface SharedProps {
    auth: { user: AuthUser | null };
    flash: { success?: string; error?: string; warning?: string };
    errors: Record<string, string>;
    routes: Record<string, string>;
    [key: string]: unknown;
}
