// External dependencies
const filter = require( 'gulp-filter' )
const mimeTypes = require( 'mime-types' )
const plumber = require( 'gulp-plumber' )
const sharp = require( 'gulp-optimize-images' )
const svgo = require( 'gulp-svgmin' )

// Local utilities
const logger = require( '@build/utils/log' )

// Config
const config = require( `${process.cwd()}/.gulpconfig.js` ).images
const loggerColor = 'green'

module.exports = ( {
    task,
    src,
    series,
    dest,
    watch,
} ) => {
    task( 'images', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Optimizing images...', loggerColor )

            let sharpFilter = filter( [
                ...mimeTypes.extensions['image/avif'],
                ...mimeTypes.extensions['image/jpeg'],
                ...mimeTypes.extensions['image/png'],
                ...mimeTypes.extensions['image/webp'],
            ].map( ( ext ) => `**/*.${ext}` ), {
                restore: true,
            } )

            let svgoFilter = filter( [
                ...mimeTypes.extensions['image/svg+xml'],
            ].map( ( ext ) => `**/*.${ext}` ), {
                restore: true,
            } )

            return src( config.paths.src, config.srcOptions )
                .pipe( plumber() )
                .pipe( sharpFilter )
                .pipe( sharp( config.pipes.sharp ) )
                .pipe( sharpFilter.restore )
                .pipe( svgoFilter )
                .pipe( svgo( config.pipes.svgo ) )
                .pipe( svgoFilter.restore )
                .pipe( dest( config.paths.dest ) )
                .on( 'finish', () => {
                    logger.log( 'Optimizing images complete!', loggerColor )
                } )

        }

        logger.disabled( 'Optimizing images' )

        cb()
    } )

    task( 'images:watch', ( cb ) => {
        if ( config.process && config.watch ) {
            logger.log( 'Watching images for changes...', loggerColor )

            watch( config.paths.watch, {
                events: [
                    'change',
                ],
            }, series( 'images' ) )

            return cb()
        }

        logger.disabled( 'Optimizing images' )

        cb()
    } )
}

