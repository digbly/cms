<?php

namespace App\Support\Customizes;

/**
 * Collects the customizer registrations contributed by modules and themes.
 *
 * Modules call {@see register()} with a callback receiving a fresh
 * {@see Customize} instance. The admin customizer controller then calls
 * {@see apply()} to run every callback against the instance it is building.
 */
class CustomizeRegistry
{
    /**
     * @var array<int, callable>
     */
    protected array $callbacks = [];

    public function register(callable $callback): void
    {
        $this->callbacks[] = $callback;
    }

    public function apply(Customize $customize): Customize
    {
        foreach ($this->callbacks as $callback) {
            $callback($customize);
        }

        return $customize;
    }

    public function flush(): void
    {
        $this->callbacks = [];
    }
}
