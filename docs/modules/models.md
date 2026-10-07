## Make model

-   Make model in module

```bash
php artisan module:make-model Article ModuleName
```

## Searchable

The Searchable trait is a reusable component in Juzaweb, designed to enable keyword-based searches on Eloquent models. It leverages the `$searchable` property to determine the fields to be searched.

### Search columns

In your model, add property `searchable` to your model.

```php
use Juzaweb\Modules\Core\Traits\Searchable;

class Article extends Model
{
    use Searchable;

    protected $searchable = [
        'title',
        'content',
    ];
}
```

Now, in the controller, you can use the `search` method instead of `where('title', 'like', '%keyword%')`.

```php
$results = Article::search('Juzaweb')->get();
```

### Fulltext Search

By default, they will use the `like` method. If you want to use fulltext search with any column, add the method as an array value.

```php
protected $searchable = [
    'name' => 'fulltext',
];
```

Don't forget to use `fulltext index` for the column in your migration.

```php
Schema::create('my_table', function (Blueprint $table) {
    // ...
    $table->string('name')->fulltext();
    // ...
});
```

### Additional Search

Define the methods in your model:

```php
public function scopeAdditionSearch(Builder $query, string $keyword): void
{
    $query->orWhere('custom_field', 'LIKE', "%{$keyword}%");
}
```

## Filterable

This trait enables filtering query results based on specified parameters. Below is an explanation of the relevant methods and how to use them:

### Filter columns

-   Add the Filterable trait to your Eloquent model:

```php
use Juzaweb\Modules\Core\Traits\Filterable;

class Post extends Model
{
    use Filterable;

    protected $filterable = ['title', 'author_id', 'category_id'];
}
```

-   Use it in a query:

```php
$filters = ['title' => 'Juzaweb', 'author_id' => 1];
$posts = Post::filter($filters)->get();
```

### Addition Filter

The `scopeAdditionFilter` method in the Filterable trait appears to allow custom or advanced filtering logic. While the method's complete implementation isn't visible yet, I'll show you how it could work and provide an example based on common practices in Juzaweb.

If `scopeAdditionFilter` is similar to scopeFilter, it likely extends the filtering capabilities, for example, adding range filtering, LIKE clauses, or date-based conditions.

```php
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Builder;

/**
 * Apply additional filters to the query.
 *
 * @param Builder $query
 * @param array $params
 * @return Builder
 */
public function scopeAdditionFilter(Builder $query, array $params): Builder
{
    if ($dateRange = Arr::get($params, 'date_range') && is_array($dateRange)) {
        $query->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
    }

    // Add more filtering conditions as needed

    return $query;
}
```

## Sortable

The Sortable trait provides a method scopeSort which can be used to sort the results of a query. This method is used in conjunction with the Eloquent ORM in Juzaweb.

### Sorting columns

-   Add the `Sortable` trait to your Eloquent model:

```php
// Assuming we have a model called `Post` with the `sortable` property defined
class Post extends Model
{
    use Sortable;

    protected $sortable = [
        'title' => 'asc',
        'created_at' => 'desc',
    ];

    // ...
}
```

-   Sorting the results of a query

```php
$posts = Post::sort(['sort_by' => 'title', 'sort_order' => 'asc'])->get();
```

In this example, we define the sortable property in the Post model and specify the default sorting for the title and created_at columns. We then use the sort method to sort the results of a query by the title column in ascending order.

### Addition Sort

This method is used to add additional sorting to the query results. For example, you can sort by the `views` column.

```php
// ...

public function scopeAdditionSort(Builder $query, array $params): Builder
{
    // Add additional sorting logic here
    // For example, you can sort by the 'views' column
    $query->orderBy('views', 'desc');

    return $query;
}

// ...
```

Sorting the results of a query with additional sorting

```php
$posts = Post::sort(['sort_by' => 'title', 'sort_order' => 'asc'])->get();
```

In this example, we define the sortable property in the Post model and specify the default sorting for the title and created_at columns. We then define the scopeAdditionSort method to add additional sorting by the views column in descending order.

By calling the sort method and passing the sorting parameters, the scopeSort method from the Sortable trait will handle the default sorting. Then, the scopeAdditionSort method will be called to add the additional sorting.

Note that the scopeAdditionSort method is called after the scopeSort method, so it can be used to further customize the sorting logic.

## Resources & Collection Resources

The HasResource trait is used to provide a convenient way to work with resources in Juzaweb, specifically when it comes to converting Eloquent models to JSON resources.

In Juzaweb, a resource is a class that represents a single entity or a collection of entities, and is used to format the data before it's returned as a JSON response. The HasResource trait provides a way to easily create and work with these resources.

To use these methods in your model, you need to include the HasResource trait in your model class:

```php
namespace Juzaweb\Modules\Example\Models;

use Illuminate\Database\Eloquent\Model;use Juzaweb\Modules\Core\Traits\HasResource;

class MyModel extends Model
{
    use HasResource;

    // ...

    public static function getResource(): string
    {
        return MyCustomResource::class;
    }

    public static function getCollectionResource(): string
    {
        return MyCustomCollectionResource::class;
    }
}
```

The `CollectionResource` is used to create a collection of resources from a collection of Eloquent models. With this setup, you can create resource instances and collection resource instances using the `makeResource()` and `makeCollectionResource()` methods, respectively.

In controller API, you can use these methods `restSuccess` to convert Eloquent models to JSON resources:

```php
use Juzaweb\Modules\Example\Models\MyModel;

// ...

$myModel = MyModel::find($id);

return $this->restSuccess($myModel);
```

## Query Cache

## Use Query Caching in Queries

Here’s an example of using the caching features in a Juzaweb query:

```php
use Juzaweb\Modules\Example\Models\YourModel;

// Cache the results of the query for 5 minutes.
$results = YourModel::query()->cacheFor(300)->get();

// Cache the query forever.
$results = YourModel::query()->cacheForever()->get();

// Flush caches tagged with 'user_data'.
YourModel::flushQueryCache(['user_data']);
```

## Control Cache Behavior

If you don’t want caching for specific queries:

```php
use Juzaweb\Modules\Example\Models\YourModel;

// Don't cache the results of the query.
$results = YourModel::query()->dontCache()->get();
```

## HasAPI Trait

The HasAPI trait is used to provide a set of methods and functionality for working with API-related data in a Juzaweb application. It's designed to help you build robust and scalable APIs by providing features such as:

1. API Scopes (`Searchable`, `Filterable`, `Sortable` traits): The trait provides a set of scopes that can be used to filter and constrain API queries. These scopes can be used to apply common filters, such as searching, sorting, and caching.
   Query Caching: The trait provides a way to cache API queries, which can help improve performance by reducing the number of database queries.
2. API Resource Management (`HasResource` trait): The trait provides a way to work with API resources, which are classes that represent data and can be used to format responses.
3. Customizable API Parameters: The trait allows you to define custom API parameters and default values, which can be used to customize the behavior of your API.

Some common use cases for the HasAPI trait include:

1. Building RESTful APIs: The trait can be used to build RESTful APIs that provide a set of endpoints for creating, reading, updating, and deleting data.
2. Providing API Data: The trait can be used to provide API data to frontend applications, mobile apps, or other services that need to consume data from your application.
3. Implementing API Caching (`QueryCacheable` trait): The trait can be used to implement caching for API queries, which can help improve performance and reduce the load on your database.

To use the HasAPI trait in your model, add the following code:

```php
use Juzaweb\Modules\Core\Traits\HasAPI;

class YourModel extends Model
{
    use HasAPI;

    // ...
}
```

Then, you can use the api scope in your controller to retrieve models with API-related constraints:

```php
$models = YourModel::api(['q' => 'search_query', 'name' => 'John Doe', 'sort_by' => 'created_at'])->get();
```

If you need custom query for your API, you can override the `scopeInApi` method in your model.

```php
 // Define custom constraints for API queries
public function scopeInApi(Builder $builder, array $params = []): Builder
{
    // Apply custom constraints here
    return $builder->where('active', true);
}
```

If you need `with` more relations for your API query, you can define the `apiWithDefaults` method in your model.

````php
public function apiWithDefaults(): array
{
    return ['category', 'author'];
}
````
