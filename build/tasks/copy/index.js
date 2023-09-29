// External dependencies
const mergeStream = require( 'merge-stream' )

// Local utilities
const logger = require( '@build/utils/log' )

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

            let streams = mergeStream()
            config.areas.forEach( ( area ) => {
                let stream = src( area.paths.src, area.srcOptions )
                    .pipe( dest( area.paths.dest ) )

                streams.add( stream )
            } )

            return streams.on( 'unpipe', () => {
                if ( streams.isEmpty() ) {
                    logger.log( 'Copying files complete!', loggerColor )
                    return cb()
                }
            } )
        }

        logger.disabled( 'Copying files' )

        cb()
    } )

    task( 'copy:watch', ( cb ) => {
        if ( config.process && config.watch ) {
            logger.log( 'Watching copy files for changes...', loggerColor )

            let watchFiles = []

            config.areas.forEach( ( area ) => {
                if ( Array.isArray( area.paths.watch ) ) {
                    watchFiles.push( ...area.paths.watch )
                } else {
                    watchFiles.push( area.paths.watch )
                }
            } )

            watchFiles = [...new Set( watchFiles )]

            watch( watchFiles, {
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

