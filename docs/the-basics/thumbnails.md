# Thumbnails

The `Thumbnail` facade allows you to define global default thumbnail images for your models. This is useful when you want to show a placeholder image if a model doesn't have an uploaded thumbnail.

## Usage

### 1. Add Trait to Model

First, ensure your model uses the `Juzaweb\Modules\Core\Traits\HasThumbnail` trait. This trait provides the `thumbnail` attribute and handling logic.

```php
namespace Juzaweb\Modules\Blog\Models;

use Juzaweb\Modules\Core\Models\Model;
use Juzaweb\Modules\Core\Traits\HasThumbnail;

class Post extends Model
{
    use HasThumbnail;

    // ...
}
```

The `HasThumbnail` trait automatically:
1.  Appends the `thumbnail` attribute to the model (so it appears in `$model->toArray()` or JSON responses).
2.  Provides the `setThumbnail($media)` helper method to easily attach/update the thumbnail.

```php
// Update thumbnail
$post->setThumbnail($request->input('thumbnail'));
```

### 2. Register Default Thumbnails

You can register the default thumbnail URLs in the `boot` method of your `ServiceProvider` using the `Thumbnail` facade.

```php
use Juzaweb\Modules\Core\Facades\Thumbnail;
use Juzaweb\Modules\Blog\Models\Post;

public function boot()
{
    Thumbnail::defaults(function () {
        return [
            Post::class => asset('assets/images/post-placeholder.png'),
        ];
    });
}
```

### 3. Retrieving Thumbnail

Now, when you access the `thumbnail` attribute of your model, it will return the uploaded image (via HasMedia) or the default placeholder if none exists.

```php
$post = Post::find(1);

// Returns uploaded thumbnail or 'assets/images/post-placeholder.png'
echo $post->thumbnail;
```

## How It Works


1.  `Thumbnail::defaults` registers a callback returning the configuration array.
2.  A global Middleware runs on every request, retrieves these defaults, and injects them into the respective Models using the `defaultThumbnail()` static method provided by the `HasThumbnail` trait.
3.  The `getThumbnailAttribute` accessor checks `getFirstMediaUrl('thumbnail')`. If it's null, it falls back to the injected static default URL.

## Image Component (x-img)

The `x-img` component provides an optimized way to display images with lazy loading support (via `lazysizes`) and automatic URL generation/resizing using the `proxy_image` helper.

### Usage

```blade
<x-img
    src="url_or_path"
    alt="Image Text"
    class="custom-class"
    :width="500"
    :height="300"
    :thumbnail="true"
    :srcset="['320w' => 320, '768w' => 768]"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | **required** | The source URL of the image. |
| `alt` | string | `''` | Types of images. |
| `class` | string | `''` | CSS classes. A `lazyload` class is automatically added. |
| `width` | int/null | `null` | Target width for resizing and HTML attribute. |
| `height` | int/null | `null` | Target height for resizing and HTML attribute. |
| `thumbnail` | bool/string | `false` | If true, generates a tiny low-quality placeholder. |
| `crop` | bool | `false` | If true, crops the image to exact dimensions. |
| `srcset` | array | `[]` | Array of width descriptors for responsive images. |

### Responsive Images (Srcset)

You can provide a `srcset` array to automatically generate responsive image URLs.

```php
[
    '320w' => [320, 180], // Descriptor '320w', Resize to 320x180
    '768w' => 768,        // Descriptor '768w', Resize width 768 (auto height)
    // or simple array
    // 1024 => 1024       // Integer key becomes 0, 1 etc. Value treated as width. Descriptor becomes '1024w'
]
```

