// External dependencies
const cssnano = require( 'cssnano' )
const filter = require( 'gulp-filter' )
const gulpIf = require( 'gulp-if' )
const lazypipe = require( 'lazypipe' )
const plumber = require( 'gulp-plumber' )
const postcss = require( 'gulp-postcss' )
const rename = require( 'gulp-rename' )
const sass = require( 'gulp-sass' )( require( 'sass' ) )
const stylelint = require( '@build/stylelint' )

// Local utilities
const logger = require( '@build/utils/log' )

// Config
const config = require( `${process.cwd()}/.gulpconfig.js` ).styles
const loggerColor = 'yellow'

module.exports = ( {
    task,
    src,
    series,
    dest,
    watch,
} ) => {
    const minTask = lazypipe()
        .pipe( filter, [
            '**/*.css',
        ] )
        .pipe( postcss, [
            cssnano( config.pipes.cssnano ),
        ] )
        .pipe( () => {
            return gulpIf( config.minify.separate, rename( {
                suffix: '.min',
            } ) )
        } )

    task( 'styles:lint', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Linting styles...', loggerColor )

            return src( config.paths.watch, config.srcOptions )
                .pipe( plumber() )
                .pipe( filter( config.filters.lint ) )
                .pipe( stylelint( {
                    ...config.pipes.stylelint,
                    failOnError: false,
                    failAfterError: true,
                } ) )
                .on( 'finish', () => {
                    logger.log( 'Linting styles complete!', loggerColor )
                } )
        }

        logger.disabled( 'Linting styles' )

        return cb()
    } )

    task( 'styles:build', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Compiling styles...', loggerColor )

            return src( config.paths.src, config.srcOptions )
                .pipe( plumber() )
                .pipe( filter( config.filters.build ) )
                .pipe( sass( config.pipes.sass ) )
                .pipe( postcss( config.pipes.postcss ) )
                .pipe( dest( config.paths.dest, config.destOptions ) )
                .pipe( gulpIf( config.minify.process, minTask() ) )
                .pipe( gulpIf( config.minify.process, dest( config.paths.dest, config.destOptions ) ) )
                .on( 'finish', () => {
                    logger.log( 'Compiling styles complete!', loggerColor )
                } )
        }

        logger.disabled( 'Compiling styles' )

        cb()
    } )

    task( 'styles', series( 'styles:lint', 'styles:build' ) )

    task( 'styles:watch', ( cb ) => {
        if ( config.process && config.watch ) {
            logger.log( 'Watching styles for changes...', loggerColor )

            watch( config.paths.watch, {
                ...config.srcOptions,
                events: [
                    'change',
                ],
            }, series( 'styles' ) )

            return cb()
        }

        logger.disabled( 'Watching styles' )

        cb()
    } )
}
