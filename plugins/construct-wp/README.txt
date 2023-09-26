=== ConstructWP ===
Contributors: apalfrey
Tags: framework, system
Requires at least: 5.4.0
Tested up to: 6.3.1
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPL v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

ConstructWP is a framework system to allow for easier development as well as useful tools and addons.

== Description ==

### ConstructWP is a framework system to allow for easier development as well as useful tools and addons.

### Features
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

== Installation ==

1. Download ConstructWP from [Github](https://github.com/apalfrey/construct-wp)
2. Upload `construct-wp` to the `/wp-content/plugins/` directory
3. Activate the plugin through the `Plugins` menu in WordPress
4. Use the Settings->ConstructWP screen to configure the plugin

== Frequently Asked Questions ==

= Where do I put my controllers? =

Controllers follow the same path and file name as their respective templates, located in the `controller` directory. e.g. For the `author.php` template, the controller will be `controller/author.php` while the controller for the `templates/template-profile.php` template will by `controller/templates/template-profile.php`

= Can I auto-initiate my models and controllers? =

Yes! Models and controllers can be auto-initiated if the class has a static method called `init`.

== Changelog ==

= 0.1.0 - 2023-09-26 =

* Initial version