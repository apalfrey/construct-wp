// External dependencies
const archiver = require( '@stgdp/gulp-archiver' )
const plumber = require( 'gulp-plumber' )

// Local utilities
const logger = require( '@build/utils/log' )

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

            let filename = config.filename + ( config.options.gzip && !config.filename.endsWith( '.gz' ) ? '.gz' : '' )

            return src( [
                ...config.paths.src,
                '!build/**',
                '!node_modules/**',
                '!gulpfile.js',
                '!package.json',
                '!package-lock.json',
                '!yarn.lock',
            ], config.srcOptions )
                .pipe( plumber() )
                .pipe( archiver( filename, config.format, config.options ) )
                .pipe( dest( config.paths.dest ) )
                .on( 'finish', () => {
                    logger.log( 'Archiving complete!', loggerColor )
                } )
        }

        logger.disabled( 'Archiving' )

        cb()
    } )
}
