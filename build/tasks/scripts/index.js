// External dependencies
const eslint = require( 'gulp-eslint-new' )
const filter = require( 'gulp-filter' )
const gulpIf = require( 'gulp-if' )
const lazypipe = require( 'lazypipe' )
const plumber = require( 'gulp-plumber' )
const rename = require( 'gulp-rename' )
const rollup = require( '@build/rollup' )
const uglify = require( 'gulp-uglify' )

// Local utilities
const logger = require( '@build/utils/log' )
const stream = require( '@build/utils/stream' )
const watchFiles = require( '@build/utils/watch-files' )

// Config
const config = require( `${process.cwd()}/.gulpconfig.js` ).scripts
const loggerColor = 'magenta'

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
                '**/*.js',
            ] )
            .pipe( uglify, pipes.uglify )
            .pipe( () => {
                return gulpIf( area.minify.separate, rename( {
                    suffix: '.min',
                } ) )
            } )()
    }

    task( 'scripts:lint', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Linting scripts...', loggerColor )

            return stream( config, ( area, pipes ) => {
                return src( area.paths.watch, area.srcOptions )
                    .pipe( plumber() )
                    .pipe( filter( pipes.filters.lint ) )
                    .pipe( eslint( pipes.eslint ) )
                    .pipe( eslint.format() )
                    .pipe( eslint.failAfterError() )
            }, () => {
                logger.log( 'Linting scripts complete!', loggerColor )
                return cb()
            } )
        }

        logger.disabled( 'Linting scripts' )

        cb()
    } )

    task( 'scripts:build', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Compiling scripts...', loggerColor )

            return stream( config, ( area, pipes ) => {
                return src( area.paths.src, area.srcOptions )
                    .pipe( plumber() )
                    .pipe( filter( pipes.filters.build ) )
                    .pipe( rollup( pipes.rollup.input, pipes.rollup.output ) )
                    .pipe( dest( area.paths.dest, area.destOptions ) )
                    .pipe( gulpIf( area.minify.process, minTask( area, pipes ) ) )
                    .pipe( gulpIf( area.minify.process, dest( area.paths.dest, area.destOptions ) ) )
            }, () => {
                logger.log( 'Compiling scripts complete!', loggerColor )
                return cb()
            } )
        }

        logger.disabled( 'Compiling scripts' )

        cb()
    } )

    task( 'scripts', series( 'scripts:lint', 'scripts:build' ) )

    task( 'scripts:watch', ( cb ) => {
        if ( config.process && config.watch ) {
            logger.log( 'Watching scripts for changes...', loggerColor )

            watch( watchFiles( config.areas ), {
                events: [
                    'change',
                ],
            }, series( 'scripts' ) )

            return cb()
        }

        logger.disabled( 'Watching scripts' )

        cb()
    } )
}

