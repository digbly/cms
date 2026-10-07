<?php

namespace Modules\Admin\Tests\Feature\Setting;

use App\Contracts\Setting as SettingContract;
use App\Models\Setting as SettingModel;
use App\Support\SettingsRegistry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Admin\Tests\TestCase;

class SettingRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        SettingsRegistry::flush();
    }

    protected function repository(): SettingContract
    {
        return app(SettingContract::class);
    }

    public function test_get_returns_defined_default_when_no_value_stored(): void
    {
        $repository = $this->repository();
        $repository->make('site_name')->default('bar')->add();

        $this->assertSame('bar', $repository->get('site_name'));
    }

    public function test_set_and_get_value(): void
    {
        $repository = $this->repository();
        $repository->set('site_name', 'baz');

        $this->assertSame('baz', $repository->get('site_name'));
    }

    public function test_get_returns_custom_default_for_missing_key(): void
    {
        $this->assertSame('def', $this->repository()->get('missing', 'def'));
    }

    public function test_array_value_is_encoded_and_decoded(): void
    {
        $repository = $this->repository();
        $repository->set('list', ['a' => 1, 'b' => [2, 3]]);

        $this->assertSame(['a' => 1, 'b' => [2, 3]], $repository->get('list'));

        $this->assertDatabaseHas('settings', [
            'code' => 'list',
            'value' => json_encode(['a' => 1, 'b' => [2, 3]]),
        ]);
    }

    public function test_typed_getters(): void
    {
        $repository = $this->repository();
        $repository->set('flag', '1');
        $repository->set('count', '2');
        $repository->set('ratio', '1.5');

        $this->assertTrue($repository->boolean('flag'));
        $this->assertSame(2, $repository->integer('count'));
        $this->assertSame(1.5, $repository->float('ratio'));
    }

    public function test_typed_getters_return_null_when_missing(): void
    {
        $repository = $this->repository();

        $this->assertNull($repository->boolean('missing'));
        $this->assertNull($repository->integer('missing'));
        $this->assertNull($repository->float('missing'));
    }

    public function test_sets_and_gets(): void
    {
        $repository = $this->repository();
        $repository->sets(['a' => '1', 'b' => '2']);

        $this->assertSame(['a' => '1', 'b' => '2'], $repository->gets(['a', 'b']));
        $this->assertSame(['c' => 'x', 'd' => 'x'], $repository->gets(['c', 'd'], 'x'));
    }

    public function test_all_and_keys_follow_definitions(): void
    {
        $repository = $this->repository();
        $repository->make('first')->default('one')->add();
        $repository->make('second')->default('two')->add();

        $this->assertEqualsCanonicalizing(['first', 'second'], $repository->keys()->all());
        $this->assertSame('one', $repository->all()->get('first'));
        $this->assertSame('two', $repository->all()->get('second'));

        $this->assertSame(['first'], $repository->keys(['first'])->values()->all());
    }

    public function test_set_invalidates_cache(): void
    {
        $repository = $this->repository();
        $repository->set('site_name', 'first');
        $this->assertSame('first', $repository->get('site_name'));

        $repository->set('site_name', 'second');
        $this->assertSame('second', $repository->get('site_name'));
    }

    public function test_translatable_value_is_stored_per_locale(): void
    {
        $repository = $this->repository();
        $repository->make('title')->translatable()->add();

        $repository->locale('en')->set('title', 'Hello');
        $repository->locale('fr')->set('title', 'Bonjour');

        $this->assertSame('Hello', $repository->locale('en')->get('title'));
        $this->assertSame('Bonjour', $repository->locale('fr')->get('title'));

        $setting = SettingModel::query()
            ->where('code', 'title')
            ->firstOrFail();

        $this->assertTrue($setting->translatable);
        $this->assertDatabaseHas('setting_translations', [
            'setting_id' => $setting->id,
            'locale' => 'en',
            'lang_value' => 'Hello',
        ]);
        $this->assertDatabaseHas('setting_translations', [
            'setting_id' => $setting->id,
            'locale' => 'fr',
            'lang_value' => 'Bonjour',
        ]);
    }

    public function test_is_json_helper(): void
    {
        $this->assertTrue(is_json('{"a":1}'));
        $this->assertFalse(is_json('abc'));
        $this->assertFalse(is_json(null));
        $this->assertFalse(is_json(''));
    }

    public function test_value_is_not_stale_across_locales_after_set(): void
    {
        $repository = $this->repository();

        $repository->locale('en')->set('site_name', 'old');
        $repository->locale('fr')->get('site_name');

        $repository->locale('en')->set('site_name', 'new');

        $this->assertSame('new', $repository->locale('fr')->get('site_name'));
    }

    public function test_scalar_strings_that_look_like_json_are_preserved(): void
    {
        $repository = $this->repository();
        $repository->set('code', '123');
        $repository->set('flag', 'true');

        $this->assertSame('123', $repository->get('code'));
        $this->assertSame('true', $repository->get('flag'));
    }

    public function test_dotted_keys_are_resolved(): void
    {
        $repository = $this->repository();
        $repository->make('mail.host')->default('smtp')->add();

        $this->assertSame('smtp', $repository->get('mail.host'));
        $this->assertSame(['mail.host'], $repository->keys()->values()->all());
        $this->assertSame('smtp', $repository->all()->get('mail.host'));
    }
}
