## Make CRUD

This guide details the process of creating a CRUD entity in Juzaweb, strictly adhering to the **Service Pattern** and project standards.

### 1. Create Migration

**Skip this step if you already have a migration file.**

Run the command to generate a migration:

```bash
php artisan module:make-migration create_posts_table ModuleName
```

#### Migration Standards

- **Main Table**: Use `uuid` for the primary key.
- **Timestamps**: Use `$table->datetimes()` instead of `$table->timestamps()`.

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Main table uses UUID
            $table->string('title');
            $table->text('content');
            $table->string('status')->default('draft');
            $table->datetimes(); // Use datetimes instead of timestamps
        });

        // Translation Table (Optional)
        Schema::create('post_translations', function (Blueprint $table) {
            $table->id(); // Sub/Translation tables use ID
            $table->uuid('post_id');
            $table->string('locale')->index();
            $table->string('title');
            $table->text('content');

            $table->unique(['post_id', 'locale']);
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_translations');
        Schema::dropIfExists('posts');
    }
};
```

### 2. Make Model

**Skip this step if you already have a model file.**

Generate the model for your module:

```bash
php artisan module:make-model Post ModuleName
```

If your entity is translatable, ensure you create the `PostTranslation` model as well.

### 3. Scaffold CRUD

Generate the Controller, Routes, and Views:

```bash
php artisan module:make-crud Post ModuleName
```

> **Note**: This command scaffolds the controller with logic inside it. You **MUST** refactor it to use the Service Pattern as described below.

### 4. Implement Service Pattern (OPTIONAL)

If logic complexity warrants, create a Service class for business logic.

#### A. Create Service Class

Create `modules/ModuleName/src/Services/PostService.php`:

```php
<?php

namespace Juzaweb\Modules\ModuleName\Services;

use Juzaweb\Modules\Core\Services\BaseService;
use Juzaweb\Modules\ModuleName\Models\Post;

class PostService extends BaseService
{
    public function __construct(Post $model)
    {
        $this->model = $model;
    }

    public function create(array $data): Post
    {
        return $this->transaction(function () use ($data) {
            // Apply business logic here
            return $this->model->create($data);
        });
    }

    public function update(array $data, int|string $id): Post
    {
        return $this->transaction(function () use ($data, $id) {
            $model = $this->find($id);
            $model->update($data);
            return $model;
        });
    }
}
```

#### B. Refactor Controller

Open `modules/ModuleName/src/Http/Controllers/PostController.php` and update it to inject the Service:

```php
<?php

namespace Juzaweb\Modules\ModuleName\Http\Controllers;

use Juzaweb\CMS\Http\Controllers\BackendController;
use Juzaweb\Modules\ModuleName\Http\Requests\PostRequest;
use Juzaweb\Modules\ModuleName\Services\PostService;
use Illuminate\Http\JsonResponse;

class PostController extends BackendController
{
    public function __construct(protected PostService $service)
    {
    }

    public function index()
    {
        return view('module_name::post.index', [
            'title' => 'Posts'
        ]);
    }

    public function store(PostRequest $request): JsonResponse
    {
        $this->service->create($request->validated());

        return $this->success([
            'message' => trans('cms::app.created_successfully')
        ]);
    }

    public function update(PostRequest $request, $id): JsonResponse
    {
        $this->service->update($request->validated(), $id);

        return $this->success([
            'message' => trans('cms::app.updated_successfully')
        ]);
    }

    // ... Implement other methods (edit, destroy) similarly
}
```

### 5. Register Route

Ensure your route follows the resource pattern in `modules/module-name/src/routes/admin.php`:

```php
use Juzaweb\Modules\ModuleName\Http\Controllers\PostController;

Route::admin('posts', PostController::class);
```
