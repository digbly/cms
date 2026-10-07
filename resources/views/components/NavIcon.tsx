import type { ComponentType } from 'react';
import {
    Circle,
    FileText,
    Images,
    LayoutDashboard,
    LayoutGrid,
    Menu as MenuIcon,
    Palette,
    Settings,
    Users,
} from 'lucide-react';

const icons: Record<string, ComponentType<{ className?: string }>> = {
    'layout-dashboard': LayoutDashboard,
    images: Images,
    users: Users,
    settings: Settings,
    palette: Palette,
    menu: MenuIcon,
    'layout-grid': LayoutGrid,
    'file-text': FileText,
};

interface NavIconProps {
    name?: string | null;
    className?: string;
}

export default function NavIcon({ name, className }: NavIconProps) {
    const Icon = (name && icons[name]) || Circle;

    return <Icon className={className} />;
}
