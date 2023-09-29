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
    const minTask = lazypipe()
        .pipe( filter, [
            '**/*.js',
        ] )
        .pipe( uglify, config.pipes.uglify )
        .pipe( () => {
            return gulpIf( config.minify.separate, rename( {
                suffix: '.min',
            } ) )
        } )

    task( 'scripts:lint', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Linting scripts...', loggerColor )

            return src( config.paths.watch, config.srcOptions )
                .pipe( plumber() )
                .pipe( filter( config.filters.lint ) )
                .pipe( eslint( config.pipes.eslint ) )
                .pipe( eslint.format() )
                .pipe( eslint.failAfterError() )
                .on( 'finish', () => {
                    logger.log( 'Linting scripts complete!', loggerColor )
                } )
        }

        logger.disabled( 'Linting scripts' )

        cb()
    } )

    task( 'scripts:build', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Compiling scripts...', loggerColor )

            return src( config.paths.src, config.srcOptions )
                .pipe( plumber() )
                .pipe( filter( config.filters.build ) )
                .pipe( rollup( config.pipes.rollup.input, config.pipes.rollup.output ) )
                .pipe( dest( config.paths.dest, config.destOptions ) )
                .pipe( gulpIf( config.minify.process, minTask() ) )
                .pipe( gulpIf( config.minify.process, dest( config.paths.dest, config.destOptions ) ) )
                .on( 'finish', () => {
                    logger.log( 'Compiling scripts complete!', loggerColor )
                } )
        }

        logger.disabled( 'Compiling scripts' )

        cb()
    } )

    task( 'scripts', series( 'scripts:lint', 'scripts:build' ) )

    task( 'scripts:watch', ( cb ) => {
        if ( config.process && config.watch ) {
            logger.log( 'Watching scripts for changes...', loggerColor )

            watch( config.paths.watch, {
                ...config.srcOptions,
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

