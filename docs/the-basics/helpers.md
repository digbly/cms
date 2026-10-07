The following functions provide utility functionality that can be used throughout the application.

## System & Configuration

**`client_ip()`**

Get client IP address. Supports Cloudflare `HTTP_CF_CONNECTING_IP`.

**`setting($key = null, $default = null)`**

Get or set a setting value.
```php
$value = setting('site_title', 'My Site');
```

**`is_super_admin($user = null)`**

Check if a user is a super admin.

**`is_admin_page()`**

Determine if the current page is an admin page.

**`default_language()`**

Get the default language locale (e.g., 'en').

**`languages()`**

Get a collection of all available languages.

**`current_actor($guard = null)`**

Get the current authenticated user or a Guest model instance.

**`user($guard = null)`**

Get the currently authenticated user.

**`cache_prefix($key)`**

Get the prefix for cache keys using the application scope.

## URL & Paths

**`home_url($uri = null, $locale = null)`**

Generate a home URL. Handles multi-language prefixes automatically.
```php
echo home_url('contact');
```

**`admin_url($uri = null)`**

Generate an admin panel URL.
```php
echo admin_url('posts/create');
```

**`upload_url($path)`**

Get the full URL for an uploaded file. Handles local and cloud storage.

**`theme_path($path = null)`**

Get the absolute path to the theme directory.

**`theme_asset($path, $theme = null)`**

Get the URL for a theme asset.
```php
echo theme_asset('css/style.css');
```

**`upload_path_format($path)`**

Format a URL back to a relative storage path.

**`back_form_url()`**

Generate a URL to redirect back to, usually the index page of a resource, stripping `create` or `edit` segments.

**`load_data_url($model, $field = 'name', $params = [])`**

Generate a URL for AJAX loading of data (Select2, etc.).

## String & Formatting

**`is_json($string)`**

Check if a string is valid JSON.

**`seo_string($string, $chars = 70)`**

Generate an SEO-friendly string (strips tags, decodes entities, truncates).

**`str_slug($string)`**
Generate a URL-friendly slug.

**`title_from_key($key)`**
Generate a readable title from a key (e.g., `user_manager` -> `User Manager`).

**`key_from_string($str)`**
Convert a string to a key format (slug with underscores).

**`number_human_format($number)`**
Format a number to human-readable format (1K, 1M, 1B).

**`map_params($text, $params)`**
Replace `{placeholders}` in text with values from an array.

**`array_to_array_string($array)`**
Convert an array to a string representation (useful for logging/debugging).

**`remove_zero_width_space_string($string)`**
Remove zero-width characters from a string.

## Media & External

**`proxy_image($url, $width = null, $height = null, $crop = false)`**
Generate a proxy URL for an image, allowing resizing and caching.

**`get_youtube_id($url)`**
Extract YouTube video ID from a URL.

**`get_vimeo_id($url)`**
Extract Vimeo video ID from a URL.

**`get_google_drive_id($url)`**
Extract Google Drive file ID from a URL.

## Date & Time

**`date_range($from, $to, $format = 'd/m/Y')`**
Generate an array of dates between two dates.

**`month_range($from, $to, $format = 'm/Y')`**
Generate an array of months between two dates.

## Security & Encryption

**`encrypt_deterministic($plaintext, $key)`**
Encrypt a string deterministically (same input always produces same output for a given key).

**`decrypt_deterministic($token, $key)`**
Decrypt a deterministically encrypted string.

**`base64url_encode($data)` / `base64url_decode($data)`**
Base64 encode/decode with URL-safe characters.

## Error Handling

**`get_error_by_exception(Throwable $e)`**
Extract standardized error details (message, line, file, code) from an exception.
