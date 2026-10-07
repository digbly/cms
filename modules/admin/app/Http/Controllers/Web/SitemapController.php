<?php

namespace Modules\Admin\Http\Controllers\Web;

use App\Contracts\Sitemap as SitemapContract;
use App\Contracts\Sitemapable;
use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Models\Pages\Page;
use Illuminate\Http\Response;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\SitemapIndex;
use Spatie\Sitemap\Tags\Sitemap as SitemapTag;
use Spatie\Sitemap\Tags\Url;
use Throwable;

class SitemapController extends Controller
{
    protected const ITEMS_PER_PAGE = 500;

    public function __construct(protected SitemapContract $sitemapRepository)
    {
        //
    }

    /**
     * Sitemap index (the main sitemap.xml).
     */
    public function index(): Response
    {
        $sitemapIndex = SitemapIndex::create();

        // Home page sitemap (one entry per language).
        $homeUrl = SitemapTag::create(route('sitemap.pages', ['page' => 'home']));

        if ($homePage = Page::home()) {
            if (isset($homePage->updated_at)) {
                $homeUrl->setLastModificationDate($homePage->updated_at);
            }
        }

        $sitemapIndex->add($homeUrl);

        foreach ($this->sitemapRepository->all() as $key => $modelClass) {
            if (! is_string($modelClass) || ! class_exists($modelClass)) {
                continue;
            }

            if (! in_array(Sitemapable::class, class_implements($modelClass) ?: [], true)) {
                continue;
            }

            try {
                /** @var class-string<Sitemapable> $modelClass */
                $totalItems = $modelClass::forSitemap()->count();

                if ($totalItems === 0) {
                    continue;
                }

                $totalPages = (int) ceil($totalItems / self::ITEMS_PER_PAGE);

                for ($page = 1; $page <= $totalPages; $page++) {
                    // The provider scope already orders by its own updated_at
                    // column, so the first row of a page is its newest entry.
                    $latest = $modelClass::forSitemap()
                        ->skip(($page - 1) * self::ITEMS_PER_PAGE)
                        ->take(self::ITEMS_PER_PAGE)
                        ->first();

                    $url = SitemapTag::create(
                        route('sitemap.provider', [
                            'provider' => $key,
                            'page' => $page,
                        ])
                    );

                    if ($latest && isset($latest->updated_at)) {
                        $url->setLastModificationDate($latest->updated_at);
                    }

                    $sitemapIndex->add($url);
                }
            } catch (Throwable) {
                // Skip providers whose table is unavailable instead of failing
                // the whole sitemap index.
                continue;
            }
        }

        return response($sitemapIndex->render(), 200, [
            'Content-Type' => 'text/xml',
        ]);
    }

    /**
     * Sitemap for a fixed page group (currently only the home page).
     */
    public function pages(string $page): Response
    {
        if ($page !== 'home') {
            abort(404, 'Sitemap page not found');
        }

        $sitemap = Sitemap::create();
        $homePage = Page::home();
        $seen = [];

        foreach (Language::codes() as $locale) {
            $location = home_url(null, $locale);

            // In single-language mode every locale resolves to the same URL.
            if (isset($seen[$location])) {
                continue;
            }

            $seen[$location] = true;

            $url = Url::create($location)->setPriority(1);

            if ($homePage && isset($homePage->updated_at)) {
                $url->setLastModificationDate($homePage->updated_at);
            }

            $sitemap->add($url);
        }

        return response($sitemap->render(), 200, [
            'Content-Type' => 'text/xml',
        ]);
    }

    /**
     * Sitemap for a registered provider, paginated.
     */
    public function provider(string $provider, int $page = 1): Response
    {
        $modelClass = $this->sitemapRepository->get($provider);

        if (! $modelClass || ! class_exists($modelClass)) {
            abort(404, 'Sitemap provider not found');
        }

        if (! in_array(Sitemapable::class, class_implements($modelClass) ?: [], true)) {
            abort(404, 'Provider does not implement Sitemapable interface');
        }

        $sitemap = Sitemap::create();

        try {
            /** @var class-string<Sitemapable> $modelClass */
            $items = $modelClass::forSitemap()
                ->skip(($page - 1) * self::ITEMS_PER_PAGE)
                ->take(self::ITEMS_PER_PAGE)
                ->get();

            foreach ($items as $item) {
                $sitemap->add($item);
            }
        } catch (Throwable $e) {
            report($e);
            abort(500, 'Unable to generate the sitemap.');
        }

        return response($sitemap->render(), 200, [
            'Content-Type' => 'text/xml',
        ]);
    }
}
