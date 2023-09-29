// External dependencies
const checktextdomain = require( 'gulp-checktextdomain' )
const plumber = require( 'gulp-plumber' )
const pot = require( 'gulp-wp-pot' )
const sort = require( 'gulp-sort' )

// Local utilities
const logger = require( '@build/utils/log' )

// Config
const config = require( `${process.cwd()}/.gulpconfig.js` ).translate
const loggerColor = 'blue'

module.exports = ( {
    task,
    src,
    series,
    dest,
    watch,
} ) => {
    task( 'translate', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Translating files...', loggerColor )

            return src( config.paths.src, config.srcOptions )
                .pipe( plumber() )
                .pipe( sort() )
                .pipe( checktextdomain( config.pipes.checktextdomain ) )
                .pipe( pot( config.pipes.pot ) )
                .pipe( dest( config.paths.dest ) )
                .on( 'finish', () => {
                    logger.log( 'Translating files complete!', loggerColor )
                } )
        }

        logger.disabled( 'Translating files' )

        cb()
    } )

    task( 'translate:watch', ( cb ) => {
        if ( config.process && config.watch ) {
            logger.log( 'Watching PHP files for changes...', loggerColor )

            watch( config.paths.watch, {
                events: [
                    'change',
                ],
            }, series( 'translate' ) )

            return cb()
        }

        logger.disabled( 'Translating files' )

        cb()
    } )
}

