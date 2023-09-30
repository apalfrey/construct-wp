// External dependencies
const archiver = require( '@stgdp/gulp-archiver' )
const plumber = require( 'gulp-plumber' )

// Local utilities
const logger = require( '@build/utils/log' )
const stream = require( '@build/utils/stream' )

// Config
const config = require( `${process.cwd()}/.gulpconfig.js` ).archive
const loggerColor = 'blue'

module.exports = ( {
    task,
    src,
    dest,
} ) => {
    task( 'archive', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Archiving...', loggerColor )

            return stream( config, ( area ) => {
                let filename = area.filename + ( area.options.gzip && !area.filename.endsWith( '.gz' ) ? '.gz' : '' )

                return src( [
                    ...area.paths.src,
                    '!build/**',
                    '!node_modules/**',
                    '!gulpfile.js',
                    '!package.json',
                    '!package-lock.json',
                    '!yarn.lock',
                ], area.srcOptions )
                    .pipe( plumber() )
                    .pipe( archiver( filename, area.format, area.options ) )
                    .pipe( dest( area.paths.dest ) )
            }, () => {
                logger.log( 'Archiving complete!', loggerColor )
                return cb()
            } )
        }

        logger.disabled( 'Archiving' )

        cb()
    } )
}
