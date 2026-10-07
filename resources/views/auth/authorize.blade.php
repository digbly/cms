<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Authorize {{ $client->name }}</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; display: flex; justify-content: center; padding: 48px 16px; }
        main { width: 100%; max-width: 420px; }
        h1 { font-size: 1.25rem; }
        ul { padding-left: 1rem; }
        form { margin-top: 1.25rem; }
        button { padding: .6rem 1rem; border-radius: .5rem; border: 1px solid #334155; cursor: pointer; }
        .approve { background: #6366f1; color: #fff; }
        .deny { background: #1e293b; color: #e2e8f0; }
    </style>
</head>
<body>
<main>
    <h1>{{ $client->name }} is requesting access</h1>
    <p>Signed in as <strong>{{ $user->email }}</strong></p>

    @if (count($scopes))
        <p>This application will be able to:</p>
        <ul>
            @foreach ($scopes as $scope)
                <li>{{ $scope->description }}</li>
            @endforeach
        </ul>
    @endif

    <form method="POST" action="{{ route('passport.authorizations.approve') }}">
        @csrf
        <input type="hidden" name="auth_token" value="{{ $authToken }}">
        <button type="submit" class="approve">Authorize</button>
    </form>

    <form method="POST" action="{{ route('passport.authorizations.deny') }}">
        @csrf
        @method('DELETE')
        <input type="hidden" name="auth_token" value="{{ $authToken }}">
        <button type="submit" class="deny">Cancel</button>
    </form>
</main>
</body>
</html>
