# Form Fields

Juzaweb CMS provides a powerful and fluent API for generating form fields using the `Field` facade. These fields are typically used in Meta Box registrations, Settings pages, or custom Admin forms.

## Basic Usage

```php
use Juzaweb\Modules\Core\Facades\Field;

// Basic syntax
Field::text($label, $name, $options);

// Fluent chaining (Recommended)
Field::select('Status', 'status')->options(['on' => 'On', 'off' => 'Off']);
```

## Global Options
All fields accept an `$options` array as the third argument, or you can use fluent methods to set them.

| Option | Fluent Method | Description |
| :--- | :--- | :--- |
| `default` | `value($value)` | Set default value |
| `id` | `id($id)` | Custom ID attribute |
| `class` | `classes($class)` | Custom CSS classes |
| `disabled` | `disabled($bool)` | Disable the input |
| `help` | `help($text)` | Help text displayed below input |
| `placeholder` | `placeholder($text)` | Input placeholder |

## Field Types

### Text
Standard text input.

```php
Field::text('Full Name', 'name')
    ->placeholder('Enter your name')
    ->help('Please enter your real name');
```

### Textarea
Multiline text input.

```php
Field::textarea('Bio', 'bio')
    ->rows(5); // Set number of rows (if supported via options)
```

### Editor
WYSIWYG Editor.

```php
Field::editor('Content', 'content');
```

### Select
Dropdown list with support for Select2, AJAX loading, and multiple selection.

```php
// Static Options
Field::select('Status', 'status')
    ->dropDownList(['published' => 'Published', 'draft' => 'Draft']);

// Collection Options
Field::select('User', 'user_id')
    ->dropDownList(User::all(), 'id', 'name');

// Multiple Select
Field::select('Categories', 'categories')
    ->multiple();

// AJAX Search (Select2)
Field::select('Author', 'author_id')
    ->loadDataModel('Juzaweb\Modules\Admin\Models\User', 'name');
// OR Custom URL
Field::select('Author', 'author_id')
    ->dataUrl(route('admin.authors.search'));
```

### Image
Single image uploader. Automatically handles file manager integration.

```php
Field::image('Thumbnail', 'thumbnail');
```

### Images
Gallery uploader (Multiple images).

```php
Field::images('Gallery', 'gallery');
```

### UploadUrl
Flexible input for uploading files or entering a URL (useful for Videos/Files).

```php
Field::uploadUrl('Video Source', 'video_url')
    ->uploadType('video') // 'image', 'file', 'video', 'audio'
    ->disk('public');     // 'public', 's3', etc.
```

### Checkbox
Single checkbox toggle.

```php
Field::checkbox('Is Featured', 'is_featured')
    ->checked(true); // default checked
```

### Date
Date picker.

```php
Field::date('Publish Date', 'publish_date')
    ->format('Y-m-d'); // Default format
```

### Tags
Tag input interface.

```php
Field::tags('Tags', 'tags');
```

### Slug
Auto-generating slug field.

```php
// Automatically listens to the 'name' field changes to update slug
Field::slug('Slug', 'slug')
    ->target('name'); // The field name to watch
```

### Security
Security Code / Captcha field (implementation depends on config).

```php
Field::security('Verify Code', 'security_code');
```

### Currency
Currency input format.

```php
Field::currency('Price', 'price');
```

### Language
Dropdown to select system languages.

```php
Field::language('Language', 'language_code');
```

## Creating Custom Fields

You can register your own field types extending the `Juzaweb\Modules\Core\Support\Fields\Field` abstract class.

1. **Create class extending `Field`**

   Create a new class, for example `Color.php`, and extend the `Field` class.

   ```php
   namespace Juzaweb\Modules\Core\Support\Fields;

   use Juzaweb\Modules\Core\Support\Fields\Field;

   class Color extends Field
   {
       // ...
   }
   ```

2. **Implement `render()` method returning a View**

   Implement the `render` method to return the blade view for your field.

   ```php
   use Illuminate\Contracts\View\View;

   class Color extends Field
   {
       public function render(): View|string
       {
           // You can pass params to view using $this->renderParams()
           return view(
               'theme::components.fields.color',
               $this->renderParams()
           );
       }
   }
   ```

3. **Register using `Field::macro` or extending `FieldFactory`**

   Register the new field in your `ServiceProvider` (e.g., `AppServiceProvider` or a Module Service Provider).

   ```php
   use Juzaweb\Modules\Core\Facades\Field;
   use Juzaweb\Modules\Core\Support\Fields\Color;

   public function boot()
   {
       Field::macro('color', function ($label, $name, $options = []) {
           return new Color($label, $name, $options);
       });
   }
   ```

### Usage

Now you can use your new field type using the macro name you registered.

```php
Field::color('Background Color', 'bg_color');
```
