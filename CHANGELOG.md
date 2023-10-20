# Changelog

## `plugins/construct-wp`

### 0.2.1 - 2023-10-20

#### Added

* Added loaded checks on `init` methods to prevent multiple inits
* Added utils for creating post type & taxonomy labels
* Default settings are now applied to the database
* Settings used by ConstructWP are not collected and stored in the `CWP_Settings::$settings` property for use wherever

#### Fixed

* Fixed issue with settings not being available if they haven't been changed

#### Changed

* Replaced `get_option` calls with using the information stored in `CWP_Settings::$settings`
* Moved asset-based settings into it's own page

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
