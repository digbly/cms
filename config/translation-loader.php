<?php

use App\Models\LanguageLine;
use Spatie\TranslationLoader\TranslationLoaderManager;
use Spatie\TranslationLoader\TranslationLoaders\Db;

return [

    /*
     * Language lines will be fetched by these loaders. You can put any class here that implements
     * the Spatie\TranslationLoader\TranslationLoaders\TranslationLoader-interface.
     */
    'translation_loaders' => [
        Db::class,
    ],

    /*
     * This is the model used by the Db Translation loader. You can put any model here
     * that extends Spatie\TranslationLoader\LanguageLine.
     */
    'model' => LanguageLine::class,

    /*
     * This is the translation manager which overrides the default Laravel `translation.loader`
     */
    'translation_manager' => TranslationLoaderManager::class,

];
