Juzaweb CMS allows themes to define custom page templates and reusable page blocks.

## Page Templates (`PageTemplate`)

The `Juzaweb\Modules\Core\Contracts\PageTemplate` contract is used to register custom page templates that users can select when editing a page in the admin panel.

### How Page Templates Work

Page templates allow you to create custom layouts for different types of pages. When a user selects a template for a page, the system will look for the corresponding view file in your theme's `templates` directory.

**File Naming Convention:**
- Template key: `cms` → View file: `templates/cms.blade.php`
- Template key: `landing_page` → View file: `templates/landing_page.blade.php`
- Template key: `home` → View file: `templates/home.blade.php`

### Registration

Page templates should be registered in your theme's `ThemeServiceProvider` class.

**Step 1: Import the Facade**
```php
use Juzaweb\Modules\Core\Facades\PageTemplate;
```

**Step 2: Create Registration Method**
```php
protected function registerPageTemplates(): void
{
    PageTemplate::make('cms', function () {
        return [
            'label' => __('CMS Page'),
            'description' => __('JuzaWeb CMS introduction and features page'),
        ];
    });

    PageTemplate::make('landing', function () {
        return [
            'label' => __('Landing Page'),
            'description' => __('Marketing landing page template'),
        ];
    });
}
```

**Step 3: Call in boot() Method**
```php
public function boot(): void
{
    $this->registerPageTemplates();

    // ... other boot code
}
```

### Complete Example

**File: `src/Providers/ThemeServiceProvider.php`**
```php
<?php

namespace Juzaweb\Themes\YourTheme\Providers;

use Juzaweb\Modules\Core\Facades\PageTemplate;
use Juzaweb\Modules\Core\Providers\ServiceProvider;

class ThemeServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->registerPageTemplates();
    }

    protected function registerPageTemplates(): void
    {
        PageTemplate::make('cms', function () {
            return [
                'label' => __('CMS Page'),
                'description' => __('JuzaWeb CMS introduction page'),
            ];
        });
    }
}
```

**File: `src/resources/views/templates/cms.blade.php`**
```blade
@extends('your-theme::layouts.main')

@section('content')
    <section class="banner-section">
        <div class="container">
            <h1>{{ __('What is JuzaWeb CMS?') }}</h1>
            <p>{{ __('Your description here') }}</p>
        </div>
    </section>

    <section class="features-section">
        <!-- Features content -->
    </section>
@endsection
```

### Template Configuration Options

The callback function can return the following options:

```php
PageTemplate::make('template-key', function () {
    return [
        // Required
        'label' => __('Template Name'),           // Display name in admin

        // Optional
        'description' => __('Template description'), // Description shown in admin
        'blocks' => [                               // Available page blocks
            'hero' => __('Hero Section'),
            'features' => __('Features Section'),
        ],
    ];
});
```

### Using Templates with Page Blocks

For advanced templates with customizable content blocks:

```php
PageTemplate::make('home', function () {
    return [
        'label' => __('Home Page'),
        'description' => __('Homepage with customizable blocks'),
        'blocks' => [
            'hero' => __('Hero Section'),
            'features' => __('Features Section'),
            'testimonials' => __('Testimonials'),
        ],
    ];
});
```

Then register corresponding PageBlocks (see PageBlock section below).

### How to Use in Admin Panel

1. Go to **Admin Panel → Pages**
2. Create new page or edit existing page
3. In the **Template** dropdown, select your registered template
4. Save the page

The page will now render using your custom template view.

### Methods

- `make(string $key, callable $callback)`: Register a new page template. Callback must return an array.
- `get(string $key)`: Get a specific page template entity.
- `all()`: Get all registered page templates as a collection.

### Best Practices

- Use descriptive template keys in `snake_case` format
- Always provide both `label` and `description` for better UX
- Keep template views in `src/resources/views/templates/` directory
- Use translation helpers `__()` for all user-facing text
- Template keys should match the view filename (without .blade.php extension)

## Page Blocks (`PageBlock`)

The `Juzaweb\Modules\Core\Contracts\PageBlock` contract is used to register custom blocks for the Page Builder.

### Usage

```php
use Juzaweb\Modules\Core\Facades\PageBlock;

// Register a new block
PageBlock::make('hero_banner', function () {
    return [
        'label' => 'Hero Banner',
        'view' => 'theme::blocks.hero_banner',
        'options' => [
            'title' => 'text',
            'background' => 'image',
        ],
    ];
});
```

### Methods

- `make(string $key, callable $callback)`: Register a new page block. Callback must return an array.
- `get(string $key)`: Get a specific page block.
- `all()`: Get all registered page blocks.
