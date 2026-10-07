export type PostStatus = 'draft' | 'published';

export type CommentStatus = 'pending' | 'approved' | 'spam' | 'rejected';

export interface PostTranslation {
    id?: number;
    locale: string;
    title: string;
    slug: string;
    description?: string | null;
    content?: string | null;
}

export interface CategoryTranslation {
    id?: number;
    locale: string;
    name: string;
    slug: string;
    description?: string | null;
}

export interface AdminPost {
    id: string;
    title: string | null;
    slug: string | null;
    description: string | null;
    content: string | null;
    status: PostStatus;
    status_label: string;
    views: number;
    user_id: string | null;
    categories: AdminCategory[];
    translations: PostTranslation[];
    created_at: string | null;
    updated_at: string | null;
}

export interface AdminCategory {
    id: string;
    name: string | null;
    slug: string | null;
    description: string | null;
    parent_id: string | null;
    is_home: boolean;
    posts_count?: number;
    translations: CategoryTranslation[];
    created_at: string | null;
    updated_at: string | null;
}

export interface AdminComment {
    id: string;
    post_id: string;
    parent_id: string | null;
    user_id: string | null;
    name: string;
    content: string;
    status: CommentStatus;
    status_label: string;
    created_at: string | null;
    updated_at: string | null;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

export interface Paginated<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface PostPayload {
    status: PostStatus;
    user_id?: string | null;
    categories: string[];
    translations: PostTranslation[];
}

export interface CategoryPayload {
    parent_id: string | null;
    is_home: boolean;
    translations: CategoryTranslation[];
}

export interface BlogAbilities {
    create?: boolean;
    update?: boolean;
    delete?: boolean;
}
