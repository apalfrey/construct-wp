// External dependencies
const checktextdomain = require( 'gulp-checktextdomain' )
const plumber = require( 'gulp-plumber' )
const pot = require( 'gulp-wp-pot' )
const sort = require( 'gulp-sort' )

// Local utilities
const logger = require( '@build/utils/log' )
const stream = require( '@build/utils/stream' )
const watchFiles = require( '@build/utils/watch-files' )

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

            return stream( config, ( area, pipes ) => {
                return src( area.paths.src, area.srcOptions )
                    .pipe( plumber() )
                    .pipe( sort() )
                    .pipe( checktextdomain( pipes.checktextdomain ) )
                    .pipe( pot( pipes.pot ) )
                    .pipe( dest( area.paths.dest ) )
            }, () => {
                logger.log( 'Translating files complete!', loggerColor )
                return cb()
            } )
        }

        logger.disabled( 'Translating files' )

        cb()
    } )

    task( 'translate:watch', ( cb ) => {
        if ( config.process && config.watch ) {
            logger.log( 'Watching PHP files for changes...', loggerColor )

            watch( watchFiles( config.areas ), {
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

