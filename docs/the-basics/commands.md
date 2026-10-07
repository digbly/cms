# Artisan Commands

In addition to standard Laravel commands, Juzaweb CMS provides several custom Artisan commands to help with management and development.

## User Management

### `user:make`
Create a new user from the command line.

**Usage:**
```bash
php artisan user:make
```
**Options:**
- `--name=NAME`: The name of the user.
- `--email=EMAIL`: The email of the user.
- `--pass=PASSWORD`: The password of the user.
- `--super-admin`: Create a super admin user.
- `--role=ROLE_NAME`: Assign a role to the user immediately.

## System Maintenance

### `log:clear`
Clear all Laravel log files in `storage/logs`.

**Usage:**
```bash
php artisan log:clear
```

### `cache:size`
Show the current size of the file-based cache.

**Usage:**
```bash
php artisan cache:size
```

## Utilities

### `mail:test`
Send a test email to verify mail configuration.

**Usage:**
```bash
php artisan mail:test --email=admin@example.com
```

## Localization

### `language:make`
Create a new language. The language code must exist in the `locales` configuration.

**Usage:**
```bash
php artisan language:make en
```

**Arguments:**
- `code`: The code of the language (e.g., `en`, `vi`).

## Theme Assets Download

### `theme:download-template`
Download a template html from a URL and save it as a blade view.

This command is interactive and will ask for:
- **Url Template**: The URL of the page you want to crawl.
- **Container**: The CSS selector of the main content area (e.g., `.container`, `#content`). Default: `.container-fluid`.
- **File**: The output filename for the blade view (e.g., `home`, `about`). Default: `index.blade.php`.

The command will crawl the content from the URL, extract the HTML inside the specified container, and save it to the theme's `resources/views` directory. The generated file will automatically extend `layouts.main`.

**Usage:**
```bash
php artisan theme:download-template theme_name
```
**Arguments:**
- `theme`: The name of the theme.

### `theme:download-style`
Download assets (CSS/JS) from a URL and configure Laravel Mix.

This command asks for the **Url Template** and then:
1. Crawls the page to find all linked CSS and JS files.
2. Downloads these files to the theme's `assets/css` and `assets/js` directories.
3. Downloads referenced assets (fonts, images) inside CSS files.
4. Generates a `mix.js` file in the theme's `assets` folder to compile these resources.

**Usage:**
```bash
php artisan theme:download-style theme_name
```
**Arguments:**
- `theme`: The name of the theme.
