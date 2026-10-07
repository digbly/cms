<?php

namespace Modules\Auth\Models;

use Illuminate\Contracts\Auth\Authenticatable;
use Laravel\Passport\Client;

class OAuthClient extends Client
{
    /**
     * First-party clients (SPA, mobile) skip the consent prompt.
     */
    public function skipsAuthorization(Authenticatable $user, array $scopes): bool
    {
        return $this->firstParty();
    }
}
