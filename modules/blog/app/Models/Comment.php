<?php

namespace Modules\Blog\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Auth\Models\User;
use Modules\Blog\Database\Factories\CommentFactory;
use Modules\Blog\Enums\CommentStatus;

class Comment extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'comments';

    protected $fillable = [
        'post_id',
        'parent_id',
        'user_id',
        'name',
        'email',
        'content',
        'status',
    ];

    protected $casts = [
        'status' => CommentStatus::class,
    ];

    protected $hidden = [
        'email',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', CommentStatus::Approved);
    }

    public function getAuthorNameAttribute(): string
    {
        return $this->name ?: ($this->author?->name ?? 'Guest');
    }

    protected static function newFactory(): CommentFactory
    {
        return CommentFactory::new();
    }
}
