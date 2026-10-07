<?php

namespace Modules\Admin\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexMediaRequest;
use App\Http\Requests\Admin\StoreMediaRequest;
use App\Http\Requests\Admin\UpdateMediaRequest;
use App\Http\Resources\MediaResource;
use App\Models\MediaItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Admin\Enums\MediaPermission;
use Modules\Admin\Http\Controllers\Web\Concerns\AuthorizesAdmin;

class MediaController extends Controller
{
    use AuthorizesAdmin;

    public function index(IndexMediaRequest $request): Response
    {
        $filters = $request->validated() + [
            'search' => null,
            'type' => null,
            'month' => null,
            'sort' => 'created_at',
            'direction' => 'desc',
        ];

        $items = MediaItem::query()
            ->with('media')
            ->when($filters['search'], function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('alt', 'like', "%{$search}%")
                        ->orWhereHas('media', fn (Builder $query) => $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('file_name', 'like', "%{$search}%"));
                });
            })
            ->when(
                $filters['type'],
                fn (Builder $query, string $type) => $query->whereHas(
                    'media',
                    fn (Builder $query) => $type === 'image'
                        ? $query->where('mime_type', 'like', 'image/%')
                        : $query->where('mime_type', 'not like', 'image/%')
                )
            )
            ->when(
                $filters['month'],
                fn (Builder $query, string $month) => $query
                    ->whereYear('created_at', substr($month, 0, 4))
                    ->whereMonth('created_at', substr($month, 5, 2))
            )
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate((int) $request->validated('per_page', 24))
            ->withQueryString();

        return Inertia::render('Admin::media/Index', [
            'title' => __('admin.media.title'),
            'items' => MediaResource::collection($items),
            'filters' => [
                'search' => $filters['search'],
                'type' => $filters['type'],
                'month' => $filters['month'],
            ],
            'abilities' => [
                'create' => $this->allows($request, MediaPermission::MediaCreate->value),
                'update' => $this->allows($request, MediaPermission::MediaUpdate->value),
                'delete' => $this->allows($request, MediaPermission::MediaDelete->value),
            ],
        ]);
    }

    /**
     * JSON feed for the media picker (session-authenticated).
     */
    public function list(IndexMediaRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();

        $items = MediaItem::query()
            ->with('media')
            ->when(
                $filters['search'] ?? null,
                fn (Builder $query, string $search) => $query->where(function (Builder $query) use ($search): void {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('alt', 'like', "%{$search}%")
                        ->orWhereHas('media', fn (Builder $query) => $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('file_name', 'like', "%{$search}%"));
                })
            )
            ->when(
                $filters['type'] ?? null,
                fn (Builder $query, string $type) => $query->whereHas(
                    'media',
                    fn (Builder $query) => $type === 'image'
                        ? $query->where('mime_type', 'like', 'image/%')
                        : $query->where('mime_type', 'not like', 'image/%')
                )
            )
            ->orderBy($filters['sort'] ?? 'created_at', $filters['direction'] ?? 'desc')
            ->paginate((int) ($filters['per_page'] ?? 24));

        return MediaResource::collection($items);
    }

    public function store(StoreMediaRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $files = $request->file('files') ?? array_filter([$request->file('file')]);

        foreach ($files as $file) {
            $item = new MediaItem([
                'title' => $data['title'] ?? null,
                'alt' => $data['alt'] ?? null,
                'caption' => $data['caption'] ?? null,
                'description' => $data['description'] ?? null,
                'uploaded_by' => $request->user()->getKey(),
            ]);

            $item->save();

            MediaItem::storeDimensions($item->addMedia($file)->toMediaCollection('default'));
        }

        return back()->with('success', __('admin.media.notices.uploaded'));
    }

    public function update(UpdateMediaRequest $request, MediaItem $media): RedirectResponse
    {
        $media->update($request->validated());

        return back()->with('success', __('admin.media.notices.updated'));
    }

    public function destroy(MediaItem $media): RedirectResponse
    {
        $media->delete();

        return back()->with('success', __('admin.media.notices.deleted'));
    }
}
