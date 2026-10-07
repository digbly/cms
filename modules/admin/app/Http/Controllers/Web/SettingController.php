<?php

namespace Modules\Admin\Http\Controllers\Web;

use App\Contracts\Setting as SettingContract;
use App\Http\Controllers\Controller;
use App\Support\AdminTranslations;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Admin\Http\Requests\Admin\SettingRequest;
use Modules\Admin\Support\MediaPreviewResolver;
use Modules\Auth\Enums\SocialProvider;

class SettingController extends Controller
{
    public function __construct(
        protected SettingContract $settings
    ) {
        //
    }

    /**
     * Show the settings form.
     */
    public function edit(AdminTranslations $translations): Response
    {
        $settings = $this->payload();

        return Inertia::render('Admin::settings/Index', [
            'title' => __('admin.nav.settings'),
            'settings' => $settings,
            'locales' => $translations->locales(),
            'media' => $this->mediaPreviews($settings),
            'socialProviders' => collect(SocialProvider::cases())
                ->map(fn (SocialProvider $provider): array => [
                    'value' => $provider->value,
                    'label' => $provider->label(),
                ])
                ->all(),
        ]);
    }

    /**
     * Persist the submitted settings.
     */
    public function store(SettingRequest $request): RedirectResponse
    {
        $this->apply($request->validated());

        return back()->with('success', __('admin.settings.notices.saved'));
    }

    /**
     * Persist validated setting values, handling translatable definitions.
     *
     * @param  array<string, mixed>  $data
     */
    protected function apply(array $data): void
    {
        $definitions = $this->settings->settings();

        DB::transaction(function () use ($data, $definitions): void {
            foreach ($data as $key => $value) {
                $definition = $definitions->get($key);

                if ($definition === null) {
                    continue;
                }

                if (($definition['translatable'] ?? false) && is_array($value)) {
                    foreach ($value as $locale => $localized) {
                        $this->settings->locale((string) $locale)->set($key, $localized);
                    }

                    continue;
                }

                $this->settings->set($key, $value);
            }
        });

        // Restore the request locale so the repository singleton (which is
        // stateful) is not left on the last edited translation.
        $this->settings->locale(app()->getLocale());
    }

    /**
     * Build the settings payload, resolving typed and localized values from
     * the registered definitions.
     *
     * @return array<string, mixed>
     */
    protected function payload(): array
    {
        $definitions = $this->settings->settings();
        $translations = $this->settings->localized();
        $payload = [];

        foreach ($definitions as $key => $definition) {
            if ($definition['translatable'] ?? false) {
                /** @var Collection $values */
                $values = $translations->get($key, new Collection);

                $payload[$key] = $values->all();

                continue;
            }

            $payload[$key] = match ($definition['type'] ?? 'string') {
                'boolean' => $this->settings->boolean($key),
                'integer' => $this->settings->integer($key),
                'float' => $this->settings->float($key),
                default => $this->settings->get($key),
            };
        }

        return $payload;
    }

    /**
     * Resolve the currently assigned branding media so the form can preview it.
     *
     * @param  array<string, mixed>  $settings
     * @return array<string, array<string, mixed>|null>
     */
    protected function mediaPreviews(array $settings): array
    {
        $previews = app(MediaPreviewResolver::class)->byId([
            $settings['logo'] ?? null,
            $settings['favicon'] ?? null,
            $settings['banner'] ?? null,
        ]);

        return [
            'logo' => $previews[$settings['logo'] ?? ''] ?? null,
            'favicon' => $previews[$settings['favicon'] ?? ''] ?? null,
            'banner' => $previews[$settings['banner'] ?? ''] ?? null,
        ];
    }
}
