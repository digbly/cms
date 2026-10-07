# Translation

Juzaweb CMS provides two types of translation: **Static Translation** (for application text) and **Database Translation** (for content).

## Static Translation

Static translation is used for translating application text such as labels, messages, and other static content.

### Import translation

```bash
php artisan translation:import
```

This command imports translations from app and modules into the database.

If you want to import only translations for a specific module, use the `--module` option.

```bash
php artisan translation:import --module=module-name
```

All languages and locales key will be imported to `translations` table. Include keys that are not declared in your language file. So you can use translate functions like `trans()`, `__()` or `t()` in react components, anywhere in your application and import them easily.

### Export translation

```bash
php artisan translation:export
```

This command exports translations from database to app and modules language files. The export is done for all languages and locales that are declared in the `translations` table.

## Database Translation

This feature is a republished, reorganized, and maintained version of [Astrotomic/Translatable](https://github.com/Astrotomic/laravel-translatable) package.

### Configuration

First, you will have to configure the locales your app should use. You can do it in `config/translatable.php`

```php
'locales' => [
    'en',
    'fr',
],
```

### Usage

In this example, we want to translate the model `Post`. We will need an extra table `post_translations`:

```php
Schema::create('posts', function(Blueprint $table) {
    $table->increments('id');
    $table->string('author');
    $table->timestamps();
});
```

And `post_translations` table:

```php
Schema::create('post_translations', function(Blueprint $table) {
    $table->increments('id');
    $table->integer('post_id')->unsigned();
    $table->string('locale', 10)->index();
    $table->string('title');
    $table->text('content');

    $table->unique(['post_id', 'locale']);
    $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
});
```

In example, columns `title` and `content` are translatable.

In model `Post`, you should use the trait `Juzaweb\Modules\Admin\Translations\Traits\Translatable`. The default convention for the translation model is PostTranslation. The array `$translatedAttributes` contains the names of the fields being translated in the `PostTranslation` model.

```php
use Juzaweb\Modules\Admin\Translations\Contracts\Translatable as TranslatableContract;
use Juzaweb\Modules\Admin\Traits\Translatable;

class Post extends Model implements TranslatableContract
{
    use Translatable;

    public $translatedAttributes = ['title', 'content'];

    protected $fillable = ['author'];
}
```

`PostTranslation` model:

```php
class PostTranslation extends Model
{
    public $timestamps = false;

    protected $fillable = ['title', 'content'];
}
```

### Query Methods

In query, You can easily get translated information according to your needs.

Returns all posts being translated in english

```php
Post::translatedIn('en')->get();
```

Returns all posts not being translated in english

```php
Post::notTranslatedIn('en')->get();
```

Returns all posts with existing translations

```php
Post::hasTranslations()->get();
```

Eager loads translation relationship only for the default and fallback (if enabled) locale

```php
Post::withTranslations()->get();
```

Returns an array containing pairs of post ids and the translated title attribute

```php
Post::translatedIn('en')->pluck('id', 'title')->all();
```

Filters posts by checking the translation against the given value

```php
// Filter by translation
Post::whereTranslation('title', 'My first post')->first();

// Filter by translation multiple columns
Post::whereTranslation('title', 'My first post')
    ->orWhereTranslation('title', 'My second post')
    ->get();

// Search by translation using LIKE
Post::whereTranslationLike('title', '%first%')->first();

// Search by translation using LIKE multiple columns
Post::whereTranslationLike('title', '%first%')
    ->orWhereTranslationLike('title', '%second%')
    ->get();

// Order by translation
Post::orderByTranslation('title')->get();
```

### Further Documentation

You can see more documentation in [astrotomic info website](https://docs.astrotomic.info/laravel-translatable).
