<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Modules\Auth\Models\User;
use Modules\Blog\Enums\CommentStatus;
use Modules\Blog\Enums\PostStatus;
use Modules\Blog\Models\Category;
use Modules\Blog\Models\Comment;
use Modules\Blog\Models\Post;

class BlogDemoSeeder extends Seeder
{
    /**
     * Seed a small demo blog so the default theme can be previewed.
     */
    public function run(): void
    {
        if (Post::query()->exists()) {
            return;
        }

        $author = User::query()->first();

        $categories = [
            'technology' => ['name' => 'Technology', 'description' => 'Product, engineering and AI.'],
            'design' => ['name' => 'Design', 'description' => 'Interfaces, systems and craft.'],
            'business' => ['name' => 'Business', 'description' => 'Strategy, growth and operations.'],
            'lifestyle' => ['name' => 'Lifestyle', 'description' => 'Work, habits and wellbeing.'],
        ];

        $categoryModels = [];

        foreach ($categories as $slug => $attributes) {
            $category = Category::query()->create(['is_home' => false]);
            $category->translations()->create([
                'locale' => 'en',
                'name' => $attributes['name'],
                'slug' => $slug,
                'description' => $attributes['description'],
            ]);

            $categoryModels[$slug] = $category;
        }

        $posts = [
            ['Building a theme system for a multi-site platform', 'technology', 'A look at how themes mirror modules: discover, activate, register and boot.'],
            ['Design tokens that scale across products', 'design', 'Why a shared token layer keeps every website consistent without slowing teams down.'],
            ['Shipping faster with vertical slices', 'business', 'Small, testable increments beat big-bang releases every single time.'],
            ['The quiet productivity of deep work', 'lifestyle', 'Protecting focus is the highest-leverage habit of the modern knowledge worker.'],
            ['Tailwind CSS v4 in production', 'technology', 'What changed, what got faster, and how to structure a build pipeline.'],
            ['Accessible by default, not by audit', 'design', 'Baking WCAG into components instead of bolting it on at the end.'],
            ['Pricing pages that convert', 'business', 'Evidence-backed patterns for communicating value clearly.'],
            ['Remote work without the burnout', 'lifestyle', 'Boundaries, routines and tools that keep energy high.'],
            ['Server-rendered Blade at scale', 'technology', 'When full-stack rendering is the pragmatic choice over a separate SPA.'],
        ];

        foreach ($posts as $index => [$title, $categorySlug, $description]) {
            $post = Post::query()->create([
                'status' => PostStatus::Published,
                'views' => random_int(20, 1500),
                'user_id' => $author?->getKey(),
            ]);

            $post->translations()->create([
                'locale' => 'en',
                'title' => $title,
                'slug' => Str::slug($title),
                'description' => $description,
                'content' => $this->content($title, $description),
            ]);

            $post->categories()->syncWithoutDetaching([$categoryModels[$categorySlug]->getKey()]);

            if ($index < 3) {
                $post->categories()->syncWithoutDetaching([$categoryModels['business']->getKey()]);
            }

            $this->seedComments($post, $index);
        }
    }

    protected function seedComments(Post $post, int $index): void
    {
        if ($index % 3 !== 0) {
            return;
        }

        $comment = Comment::query()->create([
            'post_id' => $post->getKey(),
            'name' => 'Jamie Rivera',
            'email' => 'jamie@example.com',
            'content' => 'Great write-up — the incremental approach really resonates with our team.',
            'status' => CommentStatus::Approved,
        ]);

        Comment::query()->create([
            'post_id' => $post->getKey(),
            'parent_id' => $comment->getKey(),
            'name' => 'Alex Nguyen',
            'email' => 'alex@example.com',
            'content' => 'Agreed. We adopted the same pattern last quarter and it paid off.',
            'status' => CommentStatus::Approved,
        ]);
    }

    protected function content(string $title, string $description): string
    {
        return implode("\n", [
            '<p>'.$description.'</p>',
            '<h2>Why it matters</h2>',
            '<p>'.Str::title($title).' is not just a technical detail — it shapes how teams ship, review and maintain software over time. Getting the foundations right early avoids expensive rewrites later.</p>',
            '<p>Below are the principles we rely on:</p>',
            '<ul><li>Start from the smallest useful slice.</li><li>Keep boundaries explicit and tested.</li><li>Make the common case fast and obvious.</li></ul>',
            '<h2>Putting it into practice</h2>',
            '<p>Measure before optimizing, automate the boring parts, and write down the decisions that future teammates will need. A small amount of discipline compounds quickly.</p>',
        ]);
    }
}
