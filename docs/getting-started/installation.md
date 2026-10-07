**Juzaweb CMS** is a modular, extensible **content management system (CMS)** built with **Laravel 11+, PHP 8.2, MySQL, AdminLTE, and Bootstrap 4**.
It allows users to **create and manage different types of websites** — such as blogs, news portals, movie or video sharing platforms, ...

## Tech Stack

* **Backend:** Laravel 11+, PHP 8.2
* **Database:** MySQL
* **Frontend:** AdminLTE, Bootstrap 4
* **Others:** Composer, NPM, Webpack/Mix

## Requirements

Before installing Juzaweb CMS, ensure the target system meets the minimum requirements:

-   PHP 8.2 or higher
-   Laravel 11.0 or higher
-   Mysql 5.7 or MariaDB 10.2 or higher
-   Composer 2.0 or higher
-   Node v20.11.0 or higher
-   NPM 10.2.4 or higher
-   PDO PHP Extension
-   cURL PHP Extension
-   OpenSSL PHP Extension
-   Mbstring PHP Extension
-   ZipArchive PHP Extension
-   GD PHP Extension
-   SimpleXML PHP Extension.

## Installation

Juzaweb CMS is a PHP web application that uses Composer to manage its dependencies. Ensure that Composer is installed before you begin. Ensure that Composer is installed before you begin.

### License Key and Marketplace

The License Key is required to install themes/modules from the Marketplace. You can obtain a license key from the page [API Keys](https://juzaweb.com/profile/api-keys).

During the installation process the installer will ask you for your license key. If you don't want to repeat this action, you can set it up once and for all using the command:

```bash
composer config http-basic.juzaweb.com your-email your-api-key
```

If your license can be used for multiple projects, you may consider adding the `--global` option to the command to make it available for all projects:

```bash
composer config --global http-basic.juzaweb.com your-email your-api-key
```

### Create Project

To install the platform, initialize a project using the `create-project` command in the terminal.

```bash
composer create-project juzaweb/cms blog
```

Go to project folder

```bash
cd blog
```

Run the installation command:

```bash
php artisan juzaweb:install
```

### Install with browser

1.  Open your browser and navigate to your project URL (e.g., `https://example.com`).
2.  You will be redirected to the **Installer Wizard**.
3.  Follow the steps to configure your environment:
    *   **Requirements**: Check if your server meets the requirements.
    *   **Permissions**: Ensure directory permissions are correct.
    *   **Environment**: Configure database connection and app settings.
4.  Click **Install** to complete the setup.
5.  After installation, you can log in to the Admin Panel with the account you created.

## Publish (OPTIONAL)

### Publish config

```bash
php artisan vendor:publish --tag=core-config
```

### Publish Assets

```bash
php artisan vendor:publish --tag=core-assets
```

### Publish Views

```bash
php artisan vendor:publish --tag=core-views
```

### Publish Lang

```bash
php artisan vendor:publish --tag=core-lang
```
