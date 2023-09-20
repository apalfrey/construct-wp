// Core Dependencies
const path = require( 'node:path' )

// General Gulp Dependencies
const gulp = require( 'gulp' )
const filter = require( 'gulp-filter' )
const gulpIf = require( 'gulp-if' )
const plumber = require( 'gulp-plumber' )
const through = require( 'through2' )

// Style Dependencies
const eslint = require( 'gulp-eslint-new' )
const webpack = require( 'webpack-stream' )
const uglify = require( 'gulp-uglify' )

global.iLabCompiler.libs.formatConfig( 'webpack', require( './samples/config.sample.js' ) )

const webpackConfig = global.iLabCompiler.config.app.webpack
const loggerConfig = global.iLabCompiler.config.app.logger
const loggerColor = loggerConfig.colors.webpack || 'magenta'

function getAllWatch( areas ) {
    var allWatch = []

    areas.forEach( ( area ) => {
        allWatch = allWatch.concat( area.watch )
    } )

    return allWatch
}

webpackConfig.paths.watch = getAllWatch( webpackConfig.paths.areas )

function checkProcess() {
    if ( !webpackConfig.process ) {
        global.iLabCompiler.logger.log( 'Compiling Webpack JS disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function checkWatch() {
    if ( !webpackConfig.watch ) {
        global.iLabCompiler.logger.log( 'Watching Webpack JS disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function startLog( src, dest ) {
    if ( loggerConfig.fullLog ) {
        global.iLabCompiler.logger.log( [
            'Compiling:', src, '->', dest,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Compiling Webpack JS...', loggerColor )
    }
}

function endLog( src, dest ) {
    if ( loggerConfig.fullLog ) {
        global.iLabCompiler.logger.log( [
            'Completed:', src, '->', dest,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Completed compiling Webpack JS', loggerColor )
    }
}

function watchLog() {
    global.iLabCompiler.logger.log( 'Watching Webpack JS files for compiling...', loggerColor )
}

function compile( lint = false ) {
    return through.obj( ( file, enc, cb ) => {
        if ( !checkProcess() || !file.isBuffer() ) {
            return cb( null, file )
        }

        let paths = {
            src: global.iLabCompiler.libs.relativeSrc( file.path ),
            area: global.iLabCompiler.libs.getArea( global.iLabCompiler.libs.relativeSrc( file.path ), webpackConfig.paths.areas ),
        }

        startLog( paths.src, paths.area.dest )

        gulp.src( paths.src, {
            base: paths.area.base,
        } )
            .pipe( plumber() )
            .pipe( gulpIf( lint, eslint( webpackConfig.eslint ) ) )
            .pipe( gulpIf( lint, eslint.format() ) )
            .pipe( gulpIf( lint, eslint.failOnError() ) )
            .pipe( webpack( {
                output: {
                    filename: path.basename( paths.src ),
                },
                ...webpackConfig.webpack,
            } ) )
            .pipe( gulpIf( process.env.NODE_ENV != 'development', uglify( webpackConfig.uglify ) ) )
            .pipe( gulp.dest( paths.area.dest ) )
            .on( 'finish', () => {
                endLog( paths.src, paths.area.dest )
                return cb( null, file )
            } )
    } )
}

gulp.task( 'webpack:lint', ( cb ) => {
    if ( !checkProcess() ) {
        return cb()
    }

    return gulp.src( webpackConfig.paths.watch, {
        allowEmpty: true,
    } )
        .pipe( eslint( webpackConfig.eslint ) )
        .pipe( eslint.format() )
        .pipe( eslint.failAfterError() )
} )

gulp.task( 'webpack:compile', ( cb ) => {
    if ( !checkProcess() ) {
        return cb()
    }

    return gulp.src( webpackConfig.paths.src, {
        allowEmpty: true,
    } )
        .pipe( plumber() )
        .pipe( filter( [
            '**/*.js',
            '!**/_*.js',
        ] ) )
        .pipe( compile() )
} )

gulp.task( 'webpack', gulp.series( 'webpack:lint', 'webpack:compile' ) )

gulp.task( 'webpack:watch', ( cb ) => {
    if ( !checkProcess() || !checkWatch() ) {
        return cb()
    }

    watchLog()

    gulp.watch( [
        ...webpackConfig.paths.watch,
    ], {
        allowEmpty: true,
        events: [
            'change',
        ],
    }, gulp.series( 'webpack:compile' ) )
        // TODO add on delete?
        .on( 'error', ( error ) => {
            global.iLabCompiler.logger.log( [
                'Webpack JS watch failed:', error,
            ], loggerConfig.colors.error, 'error' )
        } )

    return cb()
} )
