# Theme Assets

You can manage your theme assets (JS, CSS, Images, etc.) using Laravel Mix.

## Setup Laravel Mix

Create an `assets` folder in your theme directory (e.g., `themes/mytheme/assets`).

Create a `webpack.mix.js` file in your `assets` folder with the following content:

```javascript
const mix = require('laravel-mix');
const path = require('path');

mix.disableNotifications();
mix.version();

const baseAsset = path.relative(process.cwd(), __dirname);
const basePublish = baseAsset + '/public';

mix.setPublicPath(basePublish);

// Merge Styles
mix.styles(
    [
        baseAsset + '/css/style.css',
    ],
    `${basePublish}/css/style.min.css`
);

// Merge Scripts
mix.combine(
    [
        baseAsset + '/js/script.js',
    ],
    `${basePublish}/js/script.min.js`
);
```

### Folder Structure Example

```
themes/
├── mytheme/
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   └── script.js
│   │   ├── public/ (Auto-generated)
│   │   └── webpack.mix.js
│   ├── src/
│   └── ...
```

## Compilation

To compile your theme assets, run the following command from the root of your project:

```bash
npm run prod --theme=mytheme
```

This will compile the assets defined in your theme's `webpack.mix.js` and output them to the `public` directory defined in `basePublish`.

## Usage in Blade Views

You can use the `theme_asset()` helper to link to your compiled assets:

```php
<link rel="stylesheet" href="{{ theme_asset('css/style.min.css') }}">
<script src="{{ theme_asset('js/script.min.js') }}"></script>
```

Or use the `mix()` helper with the second parameter pointing to the theme's build directory:

```php
<link rel="stylesheet" href="{{ mix('css/style.min.css', 'themes/mytheme') }}">
<script src="{{ mix('js/script.min.js', 'themes/mytheme') }}"></script>
```
