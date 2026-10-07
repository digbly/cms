# Translation

Translation has two sides: **content models** (translatable database records)
and the **admin SPA strings** the Inertia front end loads at runtime.

## Content models

Models that store per-locale content use `astrotomic/laravel-translatable`:

```php
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;

class Post extends Model implements TranslatableContract
{
    use Translatable;

    public array $translatedAttributes = ['title', 'description', 'content', 'slug'];
}
```

Rules:

- Every translatable model **must** have a matching translation model
  (`Post` → `PostTranslation`), whose table holds the translated columns plus a
  `locale`.
- Persist a locale's values with `translateOrNew($locale)` (see
  `Page::fillTranslation()`).
- `resolvedTranslation($locale)` resolves a translation with a fallback to the
  first available locale.
- The set of locales comes from `config/locales.php`; the admin language lines
  are stored in the `Language` / `LanguageLine` models via
  `spatie/laravel-translation-loader`.

## Admin SPA strings

The Inertia admin loads its strings at runtime from the backend, one namespace
per owner. `HandleInertiaRequests` shares a `translations` prop keyed by
namespace; `App\Support\AdminTranslations` builds it from the namespaces
registered through the `AdminTranslation` registry. Each owner registers its own
namespace from its service provider, so adding a module never requires editing a
central file:

```php
use App\Facades\AdminTranslation;

AdminTranslation::make($this->nameLower, fn (): array => [
    'group' => 'reports',
    'path' => module_path($this->name, 'resources/lang'),
]);
```

When `path` is omitted the convention
`modules/<Studly(namespace)>/resources/lang` is used. Read the strings in a page
with `const { t } = useTranslation();` and `t('reports.title')` — the first
segment is the namespace.

| Namespace | Backend group | Stored in |
| --- | --- | --- |
| `common` | `common` | `resources/lang/{en,vi}/common.php` (shell + auth layout) |
| `admin` | `admin` | `modules/admin/resources/lang/{en,vi}/admin.php` (also holds backend menu labels) |
| `auth` | `admin_auth` | `modules/auth/resources/lang/{en,vi}/admin_auth.php` |
| `blog` | `blog` | `modules/blog/resources/lang/{en,vi}/blog.php` |

`registerNamespaces()` exposes each module's language directory as a translation
namespace; because a module provider only boots when the module is enabled, a
disabled module contributes no namespace or locale.

Do **not** add translation JSON to the frontend. Strings live in the backend:
the shared shell in `resources/lang/{en,vi}/common.php`, and each module's own
strings in that module's `resources/lang/` directory.

## See also

- [Modules — Information](../modules/information.md)
- [Theme Settings](theme-settings.md)
