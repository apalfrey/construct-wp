# ConstructWP

## ConstructWP is a framework system to allow for easier development as well as useful tools and addons.

## Features
* Email system with templates that can be created in the WP Admin dashboard
* Ability to autoload theme CSS & JS files if they exist
  * `assets/css/[THEME-SLUG].css`
  * `assets/js/[THEME-SLUG].js`
  * `assets/css/[TEMPLATE-FILE-NAME].css`
  * `assets/js/[TEMPLATE-FILE-NAME].js`
* Ability to autoload theme models and template controllers
  * Models located in `/models`
  * Controllers located in `/controllers` using the same name as the template file
* Additional menu item options to further customise a menu
* A custom navwalker based on Bootstrap 5
* Various settings including optimisation and access restriction
* A variety of useful utilities for use during theme or plugin development
* More to come!

## Installation

1. Download ConstructWP from [Github](https://github.com/apalfrey/construct-wp)
2. Upload `construct-wp` to the `/wp-content/plugins/` directory
3. Activate the plugin through the `Plugins` menu in WordPress
4. Use the Settings->ConstructWP screen to configure the plugin

## Frequently Asked Questions

### Where do I put my controllers?

Controllers follow the same path and file name as their respective templates, located in the `controller` directory. e.g. For the `author.php` template, the controller will be `controller/author.php` while the controller for the `templates/template-profile.php` template will by `controller/templates/template-profile.php`

### Can I auto-initiate my models and controllers?

Yes! Models and controllers can be auto-initiated if the class has a static method called `init`.

## Changelog

### 0.2.0 - 2023-10-19

#### Added

* Allowed the assets to be committed
* Custom menu item fields can now be hidden in screen options
* Custom menu item fields can now be set in the customizer
* Implemented setting to enable controllers
* Implemented settings to enable auto-enqueue of scripts & styles
* Implemented setting to control footer column count
* Implemented JS translation functionality
* Implemented settings for auto including & running theme classes
* Implemented theme texdomain autoloading & accompanying setting

#### Fixed

* Fixed settings page not loading
* Fixed PHP notice in widgets page caused by gutenberg js
* Active class is now applied to the `a` tag in the navwalker

#### Changed

* Moved settings page ad main menu item
* Moved settings pages from using tabs to working with multiple pages
* Improved how custom white logo setting is declared
* Moved both custom logos positions below site title & tagline
* Pagination util can now have a `WP_Query` object passed through for use

#### Removed

* `CWP_THEME_SLUG` is no longer needed. Theme names are now retrieved from `get_template()` and `get_stylesheet()`

### 0.1.1 - 2023-10-10

#### Fixed

* Fixed `the_logo` method in `CWP_Assets`
* Fixed theme models not being loaded correctly
* Fixed pagination not working

### 0.1.0 - 2023-09-26

* Initial version