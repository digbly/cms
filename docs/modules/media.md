# Media

## Media in Models

The `HasMedia` trait in Juzaweb CMS provides a simple way to attach media files to a model. Here's an overview of the trait and its usage.

First, you need to add the `HasMedia` trait to your model:

```php
use Juzaweb\Modules\Admin\Traits\HasMedia;

class Post extends Model
{
    use HasMedia;

    protected array $mediaChannels = ['thumbnail', 'gallery']; // Define media channels
}
```

Now, you can use methods to attach, detach, and get media files to your model:

```php
$model = new Post(); // Eloquent model using HasMedia trait

// Attach media
$model->attachMedia($mediaId, 'thumbnail');

// Check if media exists
if ($model->hasMedia('thumbnail')) {
    echo $model->getFirstMediaUrl('thumbnail');
}

// Replace media in a channel
$model->attachOrUpdateMedia($newMediaId, 'thumbnail');

// Detach media
$model->detachMedia($mediaId);

// Retrieve all media in a channel
$media = $model->getMedia('gallery');
```

## Image Conversion

Juzaweb CMS comes with a set of image converters that can be used to convert images before they are uploaded. By default, these converters are enabled.

### Register Conversions

To register a new image conversion, you can use the `register` method on the `ImageConversion` class in `boot` method of your `ServiceProvider`.

Here's an example:

```php
use Intervention\Image\Image;
use Juzaweb\Modules\Admin\Media\Contracts\ImageConversion;

$this->app[ImageConversion::class]->register(
    'thumb',
    function (Image $image) {
        // you have access to intervention/image library,
        // perform your desired conversions here
        return $image->fit(150, 150);
    }
);
```

This code registers a new image conversion called "thumb" that will resize the image to a width of 150 pixels and a height of 150 pixels.

We use `Intervention/Image` library to perform the image conversions. You can read more about it [here](https://image.intervention.io/).

### Model Conversions

To apply a conversion to a specific model, you can define conversions for each channel in the `mediaChannels` property of your model. Here's an example:

```php
use Juzaweb\Modules\Admin\Traits\HasMedia;
use Juzaweb\Modules\Admin\Media\Contracts\ImageConversion;

class Post extends Model
{
    use HasMedia;

    protected array $mediaChannels = [
        'thumbnail' => ['thumb'],
        'gallery' => ['thumb', 'medium', 'large'],
    ]
}
```

### Global Conversions

Sometimes you may want to apply a conversion to all media files. You can do this by using the `globalConversions` method on the `ImageConversion` class in `boot` method of your `ServiceProvider`. Here's an example:

```php
use Intervention\Image\Image;
use Juzaweb\Modules\Admin\Media\Contracts\ImageConversion;

$this->app[ImageConversion::class]->globalConversions(['thumb']);
```

Now, all media files will be converted to the `thumb` conversion before they are uploaded.

## Accessing From Request

**Accessing a Single Media Model**

You can use the methods directly on the Request object. These methods are automatically available throughout your application. Here’s how you can use each of them:

```php
use Illuminate\Http\Request;

public function store(Request $request)
{
    $media = $request->media('image'); // Assuming the 'image' key holds a media ID
    // Process the $media model

    $post = new Post();

    // Attach the media model
    $post->attachMedia($media, 'image');

    // Get the media URL
    echo $post->getFirstMediaUrl('image');
}
```

**Accessing Multiple Media Models**

```php
public function store(Request $request)
{
    $medias = $request->medias('images'); // Assuming the 'images' key holds an array of media IDs

    // Process the collection of media models
}
```

## Upload Media

The `MediaUploader` class in Juzaweb CMS is a class that provides a simple way to upload media files to a storage disk. Here's an overview of the class and its usage:

**Constructor**

The class constructor takes three optional parameters:

* `$source`: The source of the file to upload, which can be a string (e.g., a URL) or an instance of `Illuminate\Http\UploadedFile`.
* `$disk`: The name of the storage disk to upload to (defaults to `'public'`).
* `$name`: The name of the uploaded file (defaults to `null`, which will use the original file name).

**Methods**

The class provides several methods to customize the upload process:

* `source(string $source)`: Sets the source of the file to upload (e.x: `url`, `path`, `UploadedFile`). Defaults to `null` (autodetect).
* `disk(string $disk)`: Sets the storage disk to upload to. Defaults to `'public'`.
* `name(string $name)`: Sets the name of the uploaded file. Defaults to `null` (original file name).
* `user(int|Authenticatable $user)`: Sets the user who uploaded the file. Defaults to `null` (current user).
* `parent(int $parent)`: Sets the parent ID of the uploaded file. Defaults to `null` (root).
* `folder(?int $folder)`: Sets the folder ID of the uploaded file. Defaults to `null` (root).

**Usage**

To use the `MediaUploader` class, you can create a new instance and call the various methods to customize the upload process. Here's an example:
```php
use Juzaweb\Modules\Admin\Media\MediaUploader;

$uploader = new MediaUploader();
$uploader->source($request->file('image'));
$uploader->disk('public');
$uploader->name('my_image.jpg');
$uploader->user(1); // Set the user who uploaded the file

// Upload the file
$uploader->upload();
```

Alternatively, you can use the `make` method to create a new instance with the desired parameters:

```php
$uploader = MediaUploader::make($request->file('image'), 'public', 'my_image.jpg');
$uploader->user(1);
$uploader->upload();
```

Or you can upload file from a URL:

```php
$uploader = MediaUploader::make('https://example.com/image.jpg', 'public', 'my_image.jpg');
$uploader->user(1);
$uploader->upload();
```

Note: that the `upload` method is called automatically when the object is destroyed, so you don't need to call it explicitly unless you want to upload the file immediately.

**Optional Queueing**

If you want to process the file upload in a queue (for background processing), you can specify a queue name using the onQueue() method

```php
$mediaUploader->onQueue('upload_queue')->upload();
```

**Handling Errors**

If an error occurs during the upload (e.g., the file doesn't exist or fails validation), the upload() method will throw an exception. You can catch it like this:

```php
try {
    $media = $mediaUploader->upload();
} catch (MediaException $e) {
    // Handle the exception (e.g., show an error message)
} catch (RuntimeException $e) {
    // Handle specific runtime errors
}
```

Or you can use the `shouldUpload` method to upload from request:

```php
public function store(Request $request)
{
    $media = $request->shouldUpload('image'); // Return a Media model

    // Access the uploaded media info
    echo $media->name;
    echo $media->path;
    echo $media->size;
    // ...
}
```
