# Generic Assets

You can manage your module assets (JS, CSS, Images, etc.) using Laravel Mix.

## Setup Laravel Mix

Create an `assets` folder in your module directory (e.g., `modules/MyModule/assets`).

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
modules/
├── MyModule/
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

To compile your module assets, run the following command from the root of your project:

```bash
npm run prod --module=MyModule
```

This will compile the assets defined in your module's `webpack.mix.js` and output them to the `public` directory defined in `basePublish`.

## Usage in Blade Views

Use the `mix()` helper with the second parameter pointing to the module's build directory:

```php
<link rel="stylesheet" href="{{ mix('css/style.min.css', 'modules/mymodule') }}">
<script src="{{ mix('js/script.min.js', 'modules/mymodule') }}"></script>
```

Or you can use the `module_asset()` helper (if available) or the `asset()` helper pointing to the published path.

```php
<link rel="stylesheet" href="{{ asset('modules/mymodule/css/style.min.css') }}">
<script src="{{ asset('modules/mymodule/js/script.min.js') }}"></script>
```

If you are using the CMS standard asset publishing, the assets will ideally be published to `public/modules/mymodule/...`.
