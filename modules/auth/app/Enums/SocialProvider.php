<?php

namespace Modules\Auth\Enums;

use App\Contracts\Setting as SettingContract;

enum SocialProvider: string
{
    case Google = 'google';
    case Facebook = 'facebook';
    case Github = 'github';
    case X = 'x';
    case LinkedInOpenId = 'linkedin-openid';
    case Gitlab = 'gitlab';
    case Bitbucket = 'bitbucket';
    case Slack = 'slack';
    case Twitch = 'twitch';

    public function label(): string
    {
        return match ($this) {
            self::Google => 'Google',
            self::Facebook => 'Facebook',
            self::Github => 'GitHub',
            self::X => 'X',
            self::LinkedInOpenId => 'LinkedIn',
            self::Gitlab => 'GitLab',
            self::Bitbucket => 'Bitbucket',
            self::Slack => 'Slack',
            self::Twitch => 'Twitch',
        };
    }

    public function icon(): string
    {
        return $this->value;
    }

    /**
     * Whether the provider is enabled. An explicit CMS value wins; otherwise
     * fall back to the presence of an environment configuration.
     */
    public function isEnabled(): bool
    {
        $settings = app(SettingContract::class);

        if ($settings->configs()->has($this->settingKey('enabled'))) {
            return (bool) $settings->boolean($this->settingKey('enabled'));
        }

        return $this->hasEnvironmentCredentials();
    }

    /**
     * Whether the provider has a complete set of credentials in the
     * environment configuration.
     */
    public function hasEnvironmentCredentials(): bool
    {
        return ! empty($this->configValue('client_id'))
            && ! empty($this->configValue('client_secret'));
    }

    public function clientId(): ?string
    {
        return $this->setting($this->settingKey('client_id')) ?? $this->configValue('client_id');
    }

    public function clientSecret(): ?string
    {
        return $this->setting($this->settingKey('client_secret')) ?? $this->configValue('client_secret');
    }

    public function redirect(): string
    {
        return route('social.callback', ['driver' => $this->value]);
    }

    public function isConfigured(): bool
    {
        return $this->isEnabled()
            && ! empty($this->clientId())
            && ! empty($this->clientSecret());
    }

    /**
     * Apply the resolved credentials to the runtime services configuration so
     * Socialite picks up the CMS values.
     */
    public function configure(): void
    {
        config()->set("services.{$this->value}", [
            'client_id' => $this->clientId(),
            'client_secret' => $this->clientSecret(),
            'redirect' => $this->redirect(),
        ]);
    }

    /**
     * @return array<int, self>
     */
    public static function configured(): array
    {
        return array_values(array_filter(
            self::cases(),
            static fn (self $provider): bool => $provider->isConfigured()
        ));
    }

    public function settingKey(string $name): string
    {
        return "social_login_{$this->value}_{$name}";
    }

    protected function setting(string $key): ?string
    {
        $value = app(SettingContract::class)->get($key);

        return is_string($value) && $value !== '' ? $value : null;
    }

    protected function configValue(string $name): ?string
    {
        $value = config("services.{$this->value}.{$name}");

        return is_string($value) && $value !== '' ? $value : null;
    }
}
