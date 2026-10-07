# Themes — Widgets

A theme registers the sidebars widgets can be placed in and the widgets
themselves, then renders them. Inertia themes receive a JSON payload resolved by
`SidebarRenderer::payload()` and render each item by its `component` key:

```tsx
// themes/<theme>/resources/views/components/WidgetRenderer.tsx
switch (widget.component) {
    case 'Widgets/RecentPosts':
        return <RecentPosts {...widget.data} />;
    default:
        return null;
}
```

The bundled `default` theme ships `Widgets/Categories`, `Widgets/RecentPosts`
and `Widgets/PopularPosts`, registered from its service provider.

The backend registries (`Widget`, `Sidebar`, `ThemeSidebar`) and the renderer
contract are documented in [Widgets & Sidebars](../the-basics/widgets.md).

## See also

- [Widgets & Sidebars](../the-basics/widgets.md)
- [Templates & Blocks](templates.md)
