Themes in Juzaweb CMS are the presentation layer of your website. They control the look and feel of the frontend, including layouts, styles, and templates. Themes are stored in the `themes/` directory and can be managed via the Admin Panel.

Juzaweb Themes support:
-   **Blade Templates**: Standard Laravel Blade syntax.
-   **Asset Management**: Webpack/Laravel Mix integration for SCSS and JS.
-   **Theme Settings**: Customizable options via `theme.json` and Admin UI.
-   **Widgets & Sidebars**: Dynamic content areas.
-   **Multi-Language**: Built-in translation support.

## Getting Started

### Make a Theme

```bash
php artisan theme:make ThemeName
```

## Theme Configuration

Themes can specify required modules in their `theme.json` file. When the theme is active, required modules are automatically loaded at runtime.

### Example `theme.json`

```json
{
    "name": "itech",
    "title": "Itech - Newspaper, Blog & Magazine",
    "description": "A powerful, tech-focused newspaper and magazine theme, ideal for blogs, reviews, and high-frequency content publishing.",
    "keywords": ["blog", "newspaper", "content publishing", "reviews"],
    "author": "Author Name",
    "version": "1.0",
    "providers": [
        "Juzaweb\\Themes\\Itech\\Providers\\ThemeServiceProvider"
    ],
    "require": [
        "Blog"
    ]
}
```

The `require` field accepts an array of module names that will be booted when the theme is loaded. Required modules are registered and booted at runtime, similar to how the system boots enabled modules, but only when the theme is active.

## Folder Structure

```
├── assets
│   ├── css
│   ├── js
│   └── webpack.mix.js
├── config
│   └── itech.php
├── database
│   └── seeders
├── src
│   ├── Http
│   ├── Providers
│   ├── resources
│   └── routes
├── LICENSE
├── README.md
├── composer.json
└── theme.json
```
