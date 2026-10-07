# Theme Commands

## Management Commands

### Make a Theme

Create a new theme folder structure.

```bash
php artisan theme:make ThemeName
```

**Options:**
- `--title="My Theme"`: Set theme title.
- `--description="Description"`: Set theme description.
- `--author="Author Name"`: Set theme author.
- `--ver="1.0"`: Set theme version.

### List Themes

List all available themes installed in the system.

```bash
php artisan theme:list
```

### Activate Theme

Activate a specific theme.

```bash
php artisan theme:active ThemeName
```

### Publish Theme Assets

Publish theme assets, views, or language files to the public/resource directories.

```bash
php artisan theme:publish ThemeName
```

**Arguments:**
- `type` (optional): `assets` (default), `views`, `lang`.

```bash
php artisan theme:publish ThemeName assets
php artisan theme:publish ThemeName views
```

### Seed Theme Data

Run the `DatabaseSeeder` of a specific theme.

```bash
php artisan theme:seed ThemeName
```

## Generator Commands

### Make Controller

Create a new controller for a theme.

```bash
php artisan theme:make-controller ControllerName ThemeName
```

### Make View

Create a new blade view file for a theme.

```bash
php artisan theme:make-view view-name ThemeName
```

### Make Template

Create a new Page Template for a theme.

```bash
php artisan theme:make-template TemplateName ThemeName
```

### Make Page Block

Create a new Page Block for a theme.

```bash
php artisan theme:make-block BlockName ThemeName
```
