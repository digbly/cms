<?php

namespace App\Modules;

use Illuminate\Support\Str;
use Nwidart\Modules\Exceptions\ModuleNotFoundException;
use Nwidart\Modules\Laravel\LaravelFileRepository;

class FileRepository extends LaravelFileRepository
{
    public function getModulePath($module): string
    {
        try {
            return $this->findOrFail($module)->getPath().'/';
        } catch (ModuleNotFoundException $e) {
            return $this->getPath().'/'.Str::slug($module).'/';
        }
    }
}
