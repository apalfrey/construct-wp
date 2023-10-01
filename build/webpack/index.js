// External dependencies
const { ESLint } = require( 'eslint' )
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
const stream = require( '@build/utils/stream' )
const watchFiles = require( '@build/utils/watch-files' )

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
            } )
    }

    task( 'webpack:lint', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Linting webpack scripts...', loggerColor )

            const Linter = config.pipes.eslint.eslint ?
                config.pipes.eslint.eslint :
                ESLint

            return ( async function main() {
                const eslint = new Linter( {
                    ...config.pipes.eslint.options
                } )
                const results = await eslint.lintFiles( watchFiles( config.areas ) )
                const formatter = await eslint.loadFormatter( config.pipes.eslint.formatter || 'stylish' )
                const resultText = formatter.format( results )

                if ( !resultText.length ) {
                    console.log( '\n\x1b[32mNo errors found!\x1b[0m\n' )
                } else {
                    console.log( resultText )
                }
            } )().then( () => {
                logger.log( 'Linting webpack scripts complete!', loggerColor )
                cb()
            } )
        }

        logger.disabled( 'Linting webpack scripts' )

        cb()
    } )

    task( 'webpack:build', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Compiling webpack scripts...', loggerColor )

            return stream( config, ( area, pipes ) => {
                return src( area.paths.src, area.srcOptions )
                    .pipe( plumber() )
                    .pipe( filter( pipes.filters.build ) )
                    .pipe( named() )
                    .pipe( webpack( pipes.webpack ) )
                    .pipe( dest( area.paths.dest, area.destOptions ) )
                    .pipe( gulpIf( area.minify.process, minTask( area, pipes ) ) )
                    .pipe( gulpIf( area.minify.process, dest( area.paths.dest, area.destOptions ) ) )
            }, () => {
                logger.log( 'Compiling webpack scripts complete!', loggerColor )
                return cb()
            } )
        }

        logger.disabled( 'Compiling webpack scripts' )

        cb()
    } )

    task( 'webpack', series( 'webpack:lint', 'webpack:build' ) )

    task( 'webpack:watch', ( cb ) => {
        if ( config.process && config.watch ) {
            logger.log( 'Watching webpack scripts for changes...', loggerColor )

            watch( watchFiles( config.areas ), {
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

