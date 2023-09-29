// External dependencies
const browserSync = require( 'browser-sync' )

// Local utilities
const logger = require( '@build/utils/log' )

// Config
const config = require( `${process.cwd()}/.gulpconfig.js` ).browsersync
const loggerColor = 'cyan'

module.exports = ( {
    task,
} ) => {
    task( 'browsersync', ( cb ) => {
        if ( config.watch ) {
            logger.log( 'Watching server files for changes...', loggerColor )
            browserSync( config.browsersync )
            cb()
        } else {
            logger.disabled( 'BrowserSync' )

            cb()
        }
    } )
}
