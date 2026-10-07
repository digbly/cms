<?php

namespace Modules\Auth\Traits;

trait HasSafeRedirect
{
    /**
     * Only allow internal, single-slash relative redirect targets.
     */
    protected function safeRedirect(?string $url): ?string
    {
        if ($url === null || $url === '') {
            return null;
        }

        // Reject absolute and protocol-relative targets, backslash-normalised
        // paths (browsers treat "\" like "/", enabling //host escapes) and
        // control characters that could smuggle another host into the header.
        if (! str_starts_with($url, '/')
            || str_starts_with($url, '//')
            || str_contains($url, '\\')
            || preg_match('/[\x00-\x1f]/', $url) === 1
        ) {
            return null;
        }

        return $url;
    }
}
