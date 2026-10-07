This guide will help you configure Google Analytics to display dashboard charts in your application.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Access to Google Analytics

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter a project name (e.g., "My Analytics Dashboard")
4. Click **Create**

## Step 2: Enable Google Analytics Data API

1. In your Google Cloud project, go to **APIs & Services** → **Library**
2. Search for "Google Analytics Data API"
3. Click on **Google Analytics Data API**
4. Click **Enable**

## Step 3: Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in the service account details:
   - **Service account name**: e.g., "analytics-dashboard"
   - **Service account ID**: will be auto-generated
   - **Description**: Optional description
4. Click **Create and Continue**
5. Skip the optional steps (Grant users access to this service account)
6. Click **Done**

## Step 4: Create and Download Service Account Key

1. In **Credentials** page, find your newly created service account
2. Click on the service account email
3. Go to the **Keys** tab
4. Click **Add Key** → **Create new key**
5. Select **JSON** as the key type
6. Click **Create**
7. The JSON file will be automatically downloaded to your computer

> [!IMPORTANT]
> Keep this JSON file secure! It contains credentials that grant access to your Google Analytics data.

## Step 5: Upload Service Account Credentials

1. Rename the downloaded JSON file to `service-account-credentials.json`
2. Place it in your Laravel application at:
   ```
   storage/app/analytics/service-account-credentials.json
   ```
3. Make sure the directory exists:
   ```bash
   mkdir -p storage/app/analytics
   ```

## Step 6: Get Google Analytics Property ID

### Method 1: Using Google Analytics Admin

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in the bottom left)
3. In the **Property** column, select your property
4. Click **Property Settings**
5. Copy the **Property ID** (starts with numbers, e.g., `123456789`)

### Method 2: Using Google Analytics Data Stream

1. In Google Analytics **Admin**, go to **Data Streams**
2. Select your data stream (Web, iOS, or Android)
3. You'll see the **Measurement ID** (e.g., `G-XXXXXXXXXX`)
4. The Property ID is shown at the top of the page

> [!NOTE]
> The Property ID is different from the Measurement ID. Make sure you copy the correct **Property ID** (numeric format).

## Step 7: Grant Service Account Access to Google Analytics

1. In Google Analytics **Admin**, go to **Property Access Management**
2. Click the **+** icon to add users
3. Enter the service account email (find it in the downloaded JSON file, under `client_email`)
   - Example: `analytics-dashboard@your-project.iam.gserviceaccount.com`
4. Select role: **Viewer** (minimum required) or **Analyst**
5. Click **Add**

## Step 8: Configure Laravel Application

### Option 1: Using Environment Variables (Recommended)

Add to your `.env` file:

```bash
ANALYTICS_PROPERTY_ID=123456789
```

The service account credentials path is already configured in `config/analytics.php`:
```php
'service_account_credentials_json' => storage_path('app/analytics/service-account-credentials.json'),
```

### Option 2: Using Array Credentials

Instead of a file path, you can pass credentials as an array. Edit `config/analytics.php`:

```php
'service_account_credentials_json' => [
    'type' => 'service_account',
    'project_id' => 'your-project-id',
    'private_key_id' => 'your-private-key-id',
    'private_key' => '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
    'client_email' => 'your-service-account@your-project.iam.gserviceaccount.com',
    'client_id' => 'your-client-id',
    'auth_uri' => 'https://accounts.google.com/o/oauth2/auth',
    'token_uri' => 'https://oauth2.googleapis.com/token',
    'auth_provider_x509_cert_url' => 'https://www.googleapis.com/oauth2/v1/certs',
    'client_x509_cert_url' => 'your-cert-url',
],
```

> [!WARNING]
> If using array credentials, make sure to keep your `.env` file secure and never commit it to version control.

## Step 9: Verify Configuration

### Check File Permissions

Ensure the JSON file is readable by your web server:

```bash
chmod 644 storage/app/analytics/service-account-credentials.json
```

### Test the Connection

Create a test route or command to verify the setup:

```php
use Spatie\Analytics\Analytics;
use Spatie\Analytics\Period;

$analytics = app(Analytics::class);
$analyticsData = $analytics->fetchTotalVisitorsAndPageViews(Period::days(7));

dd($analyticsData);
```

If configured correctly, you should see analytics data returned.

## Troubleshooting

### Error: "Service account credentials file not found"

- Verify the file path is correct
- Check file permissions
- Ensure the directory exists

### Error: "User does not have sufficient permissions"

- Make sure you granted the service account access in Google Analytics (Step 7)
- Wait a few minutes for permissions to propagate
- Verify you're using the correct Property ID

### Error: "API has not been used in project"

- Enable the Google Analytics Data API in your Google Cloud project (Step 2)
- Wait a few minutes for the API to be fully enabled

### Error: "Invalid property ID"

- Double-check the Property ID in Google Analytics
- Ensure you're using the Property ID, not the Measurement ID
- Property IDs are numeric (e.g., `123456789`), not alphanumeric (e.g., `G-XXXXXXXXXX`)

## Cache Configuration

Analytics responses are cached by default for 24 hours. You can adjust this in `config/analytics.php`:

```php
'cache_lifetime_in_minutes' => 60 * 24, // 24 hours
```

To disable caching:

```php
'cache_lifetime_in_minutes' => 0,
```

## Security Best Practices

1. **Never commit credentials to version control**
   - Add `storage/app/analytics/*.json` to `.gitignore`
   
2. **Restrict file permissions**
   ```bash
   chmod 600 storage/app/analytics/service-account-credentials.json
   ```

3. **Use environment variables**
   - Store sensitive configuration in `.env` file
   
4. **Grant minimal permissions**
   - Service account only needs **Viewer** role in Google Analytics

5. **Rotate keys regularly**
   - Create new service account keys periodically
   - Delete old keys from Google Cloud Console

## Additional Resources

- [Google Analytics Data API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Spatie Laravel Analytics Package](https://github.com/spatie/laravel-analytics)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
