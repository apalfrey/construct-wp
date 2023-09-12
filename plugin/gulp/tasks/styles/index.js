// Core Dependencies
const fs = require( 'node:fs' )

// General Gulp Dependencies
const gulp = require( 'gulp' )
const filter = require( 'gulp-filter' )
const gulpIf = require( 'gulp-if' )
const plumber = require( 'gulp-plumber' )
const sourcemaps = require( 'gulp-sourcemaps' )
const through = require( 'through2' )

// Style Dependencies
const stylelint = require( './libs/stylelint' )
const inheritance = require( 'gulp-sass-parent' )
const sass = require( 'gulp-sass' )( require( 'sass' ) )
const postcss = require( 'gulp-postcss' )
const cssnano = require( 'cssnano' )

global.iLabCompiler.libs.formatConfig( 'css', require( './samples/config.sample.js' ) )
global.iLabCompiler.libs.checkConfig( './.browserslistrc', './samples/.browserslistrc' )
global.iLabCompiler.libs.checkConfig( './.stylelintignore', './samples/.stylelintignore' )
global.iLabCompiler.libs.checkConfig( './.stylelintrc', './samples/.stylelintrc' )

const cssConfig = global.iLabCompiler.config.app.css
const loggerConfig = global.iLabCompiler.config.app.logger
const loggerColor = loggerConfig.colors.css || 'yellow'

function checkProcess() {
    if ( !cssConfig.process ) {
        global.iLabCompiler.logger.log( 'Compiling SCSS disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function checkWatch() {
    if ( !cssConfig.watch ) {
        global.iLabCompiler.logger.log( 'Watching SCSS disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function startLog( src, dest ) {
    if ( loggerConfig.full_log ) {
        global.iLabCompiler.logger.log( [
            'Compiling:', src, '->', dest,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Compiling CSS...', loggerColor )
    }
}

function endLog( src, dest ) {
    if ( loggerConfig.full_log ) {
        global.iLabCompiler.logger.log( [
            'Completed:', src, '->', dest,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Completed compiling CSS', loggerColor )
    }
}

function watchLog() {
    global.iLabCompiler.logger.log( 'Watching SCSS files for compiling...', loggerColor )
}

function compile( lint = false ) {
    return through.obj( ( file, enc, cb ) => {
        if ( !checkProcess() || !file.isBuffer() ) {
            return cb( null, file )
        }

        let paths = {
            src: global.iLabCompiler.libs.relativeSrc( file.path ),
            area: global.iLabCompiler.libs.getArea( global.iLabCompiler.libs.relativeSrc( file.path ), cssConfig.paths.areas ),
        }

        startLog( paths.src, paths.area.dest )

        let lintError = false

        gulp.src( paths.src, {
            base: paths.area.base,
        } )
            .pipe( plumber() )
            .pipe( gulpIf( lint, stylelint( {
                ...cssConfig.stylelint,
                failOnError: true,
                failAfterError: false,
            } ).on( 'error', () => {
                lintError = true
            } ) ) )
            .pipe( through.obj( ( file2, enc, cb ) => {
                if ( lintError ) {
                    return cb()
                }

                return cb( null, file2 )
            } ) )
            // TODO fix, it's slowing things down
            .pipe( inheritance( {
                dir: paths.area.base,
            } ) )
            .pipe( gulpIf( cssConfig.sourcemaps, sourcemaps.init( global.iLabCompiler.config.app.sourcemaps.init ) ) )
            .pipe( sass( cssConfig.sass ) )
            .pipe( postcss( cssConfig.postcss ) )
            .pipe( gulpIf( process.env.NODE_ENV != 'development', postcss( [
                cssnano( cssConfig.cssnano ),
            ] ) ) )
            .pipe( gulpIf( cssConfig.sourcemaps, sourcemaps.write( global.iLabCompiler.config.app.sourcemaps.write.path, global.iLabCompiler.config.app.sourcemaps.write.options ) ) )
            .pipe( gulp.dest( paths.area.dest ) )
            .on( 'finish', () => {
                endLog( paths.src, paths.area.dest )
                return cb( null, file )
            } )
    } )
}

gulp.task( 'css:lint', ( cb ) => {
    if ( !checkProcess() ) {
        return cb()
    }

    return gulp.src( cssConfig.paths.src, {
        allowEmpty: true,
    } )
        .pipe( plumber() )
        .pipe( stylelint( {
            ...cssConfig.stylelint,
            failOnError: false,
            failAfterError: true,
        } ) )
} )

gulp.task( 'css:compile', ( cb ) => {
    if ( !checkProcess() ) {
        return cb()
    }

    return gulp.src( cssConfig.paths.src, {
        allowEmpty: true,
    } )
        .pipe( plumber() )
        .pipe( filter( [
            '**/*.scss',
            '!**/_*.scss',
        ] ) )
        .pipe( compile() )
} )

gulp.task( 'css', gulp.series( 'css:lint', 'css:compile' ) )

gulp.task( 'css:watch', ( cb ) => {
    if ( !checkProcess() || !checkWatch() ) {
        return cb()
    }

    watchLog()

    gulp.watch( cssConfig.paths.src, {
        allowEmpty: true,
    } )
        .on( 'change', ( file ) => {
            if ( fs.existsSync( file ) && fs.statSync( file ).isFile() ) {
                return gulp.src( file )
                    .pipe( plumber() )
                    .pipe( compile( true ) )
            }
        } )
        // TODO add on delete?
        .on( 'error', ( error ) => {
            global.iLabCompiler.logger.log( [
                'SCSS watch failed:', error,
            ], loggerConfig.colors.error, 'error' )
        } )

    return cb()
} )
