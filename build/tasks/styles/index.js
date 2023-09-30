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
const stream = require( '@build/utils/stream' )
const watchFiles = require( '@build/utils/watch-files' )

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
    const minTask = ( area, pipes ) => {
        return lazypipe()
            .pipe( filter, [
                '**/*.css',
            ] )
            .pipe( postcss, [
                cssnano( pipes.cssnano ),
            ] )
            .pipe( () => {
                return gulpIf( area.minify.separate, rename( {
                    suffix: '.min',
                } ) )
            } )()
    }

    task( 'styles:lint', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Linting styles...', loggerColor )

            return stream( config, ( area, pipes ) => {
                return src( area.paths.watch, area.srcOptions )
                    .pipe( plumber() )
                    .pipe( filter( pipes.filters.lint ) )
                    .pipe( stylelint( {
                        ...pipes.stylelint,
                        failOnError: false,
                        failAfterError: true,
                    } ) )
            }, () => {
                logger.log( 'Linting styles complete!', loggerColor )
                return cb()
            } )
        }

        logger.disabled( 'Linting styles' )

        return cb()
    } )

    task( 'styles:build', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Compiling styles...', loggerColor )

            return stream( config, ( area, pipes ) => {
                return src( area.paths.src, area.srcOptions )
                    .pipe( plumber() )
                    .pipe( filter( pipes.filters.build ) )
                    .pipe( sass( pipes.sass ) )
                    .pipe( postcss( pipes.postcss ) )
                    .pipe( dest( area.paths.dest, area.destOptions ) )
                    .pipe( gulpIf( area.minify.process, minTask( area, pipes ) ) )
                    .pipe( gulpIf( area.minify.process, dest( area.paths.dest, area.destOptions ) ) )
            }, () => {
                logger.log( 'Compiling styles complete!', loggerColor )
                return cb()
            } )

                .on( 'finish', () => {
                } )
        }

        logger.disabled( 'Compiling styles' )

        cb()
    } )

    task( 'styles', series( 'styles:lint', 'styles:build' ) )

    task( 'styles:watch', ( cb ) => {
        if ( config.process && config.watch ) {
            logger.log( 'Watching styles for changes...', loggerColor )

            watch( watchFiles( config.areas ), {
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
