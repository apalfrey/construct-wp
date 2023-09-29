// External dependencies
const eslint = require( 'gulp-eslint-new' )
const filter = require( 'gulp-filter' )
const gulpIf = require( 'gulp-if' )
const lazypipe = require( 'lazypipe' )
const named = require( 'vinyl-named' )
const plumber = require( 'gulp-plumber' )
const rename = require( 'gulp-rename' )
const uglify = require( 'gulp-uglify' )
const webpack = require( 'webpack-stream' )

// Local utilities
const logger = require( '@build/utils/log' )

// Config
const config = require( `${process.cwd()}/.gulpconfig.js` ).webpack
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

    task( 'webpack:lint', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Linting webpack scripts...', loggerColor )

            return src( config.paths.watch, config.srcOptions )
                .pipe( plumber() )
                .pipe( filter( config.filters.lint ) )
                .pipe( eslint( config.pipes.eslint ) )
                .pipe( eslint.format() )
                .pipe( eslint.failAfterError() )
                .on( 'finish', () => {
                    logger.log( 'Linting webpack scripts complete!', loggerColor )
                } )
        }

        logger.disabled( 'Linting webpack scripts' )

        cb()
    } )

    task( 'webpack:build', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Compiling webpack scripts...', loggerColor )

            return src( config.paths.src, config.srcOptions )
                .pipe( plumber() )
                .pipe( filter( config.filters.build ) )
                .pipe( named() )
                .pipe( webpack( config.pipes.webpack ) )
                .pipe( dest( config.paths.dest, config.destOptions ) )
                .pipe( gulpIf( config.minify.process, minTask() ) )
                .pipe( gulpIf( config.minify.process, dest( config.paths.dest, config.destOptions ) ) )
                .on( 'finish', () => {
                    logger.log( 'Compiling webpack scripts complete!', loggerColor )
                } )
        }

        logger.disabled( 'Compiling webpack scripts' )

        cb()
    } )

    task( 'webpack', series( 'webpack:lint', 'webpack:build' ) )

    task( 'webpack:watch', ( cb ) => {
        if ( config.process && config.watch ) {
            logger.log( 'Watching webpack scripts for changes...', loggerColor )

            watch( config.paths.watch, {
                ...config.srcOptions,
                events: [
                    'change',
                ],
            }, series( 'webpack' ) )

            return cb()
        }

        logger.disabled( 'Watching webpack scripts' )

        cb()
    } )
}

