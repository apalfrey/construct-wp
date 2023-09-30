// Local utilities
const logger = require( '@build/utils/log' )
const stream = require( '@build/utils/stream' )
const watchFiles = require( '@build/utils/watch-files' )

// Config
const config = require( `${process.cwd()}/.gulpconfig.js` ).copy
const loggerColor = 'blue'

module.exports = ( {
    task,
    src,
    series,
    dest,
    watch,
} ) => {
    task( 'copy', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Copying files...', loggerColor )

            return stream( config, ( area ) => {
                return src( area.paths.src, area.srcOptions )
                    .pipe( dest( area.paths.dest ) )
            }, () => {
                logger.log( 'Copying files complete!', loggerColor )
                return cb()
            } )
        }

        logger.disabled( 'Copying files' )

        cb()
    } )

    task( 'copy:watch', ( cb ) => {
        if ( config.process && config.watch ) {
            logger.log( 'Watching copy files for changes...', loggerColor )

            watch( watchFiles( config.areas ), {
                events: [
                    'change',
                ],
            }, series( 'copy' ) )

            return cb()
        }

        logger.disabled( 'Copying files' )

        cb()
    } )
}

