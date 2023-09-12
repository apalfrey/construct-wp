// Core Dependencies
const fs = require( 'node:fs' )
const path = require( 'node:path' )

// General Gulp Dependencies
const gulp = require( 'gulp' )
const filter = require( 'gulp-filter' )
const gulpIf = require( 'gulp-if' )
const plumber = require( 'gulp-plumber' )
const sourcemaps = require( 'gulp-sourcemaps' )
const through = require( 'through2' )

// Style Dependencies
const eslint = require( 'gulp-eslint-new' )
const rollup = require( './libs/rollup' ).rollup
const uglify = require( 'gulp-uglify' )

const pkg = require( '../../../package.json' )
global.iLabCompiler.libs.formatConfig( 'js', require( './samples/config.sample.js' ) )
global.iLabCompiler.libs.checkConfig( './.eslintignore', './samples/.eslintignore' )
global.iLabCompiler.libs.checkConfig( './.eslintrc', './samples/.eslintrc' )

const jsConfig = global.iLabCompiler.config.app.js
const loggerConfig = global.iLabCompiler.config.app.logger
const loggerColor = loggerConfig.colors.js || 'magenta'

function checkProcess() {
    if ( !jsConfig.process ) {
        global.iLabCompiler.logger.log( 'Compiling JS disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function checkWatch() {
    if ( !jsConfig.watch ) {
        global.iLabCompiler.logger.log( 'Watching JS disabled in the app config', loggerConfig.colors.error )
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
        global.iLabCompiler.logger.log( 'Compiling JS...', loggerColor )
    }
}

function endLog( src, dest ) {
    if ( loggerConfig.full_log ) {
        global.iLabCompiler.logger.log( [
            'Completed:', src, '->', dest,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Completed compiling JS', loggerColor )
    }
}

function watchLog() {
    global.iLabCompiler.logger.log( 'Watching JS files for compiling...', loggerColor )
}

function compile( lint = false ) {
    return through.obj( ( file, enc, cb ) => {
        if ( !checkProcess() || !file.isBuffer() ) {
            return cb( null, file )
        }

        let paths = {
            src: global.iLabCompiler.libs.relativeSrc( file.path ),
            area: global.iLabCompiler.libs.getArea( global.iLabCompiler.libs.relativeSrc( file.path ), jsConfig.paths.areas ),
        }
        paths.dest = path.dirname( paths.area.dest + paths.src.replace( `${paths.area.base}`, '' ) )

        if ( paths.src.includes( 'js/libs/' ) ) {
            gulp.src( paths.src, {
                base: paths.area.base,
            } )
                .pipe( plumber() )
                .pipe( gulpIf( lint, eslint( jsConfig.eslint ) ) )
                .pipe( gulpIf( lint, eslint.format() ) )
                .pipe( gulpIf( lint, eslint.failOnError() ) )

            paths = {
                src: global.iLabCompiler.libs.relativeSrc( `src/js/${pkg.name}.js` ),
                area: global.iLabCompiler.libs.getArea( global.iLabCompiler.libs.relativeSrc( `src/js/${pkg.name}.js` ), jsConfig.paths.areas ),
            }
            paths.dest = path.dirname( paths.area.dest + paths.src.replace( `${paths.area.base}`, '' ) )
        }

        let rollupConfig = jsConfig.rollup
        rollupConfig.output.file = path.basename( paths.src )

        startLog( paths.src, paths.dest )

        gulp.src( paths.src, {
            base: paths.area.base,
        } )
            .pipe( plumber() )
            .pipe( gulpIf( lint, eslint( jsConfig.eslint ) ) )
            .pipe( gulpIf( lint, eslint.format() ) )
            .pipe( gulpIf( lint, eslint.failOnError() ) )
            .pipe( gulpIf( jsConfig.sourcemaps, sourcemaps.init( global.iLabCompiler.config.app.sourcemaps.init ) ) )
            .pipe( rollup( rollupConfig ) )
            .pipe( gulpIf( process.env.NODE_ENV != 'development', uglify( jsConfig.uglify ) ) )
            .pipe( gulpIf( jsConfig.sourcemaps, sourcemaps.write( global.iLabCompiler.config.app.sourcemaps.write.path, global.iLabCompiler.config.app.sourcemaps.write.options ) ) )
            .pipe( gulp.dest( paths.dest ) )
            .on( 'finish', () => {
                endLog( paths.src, paths.dest )
                return cb( null, file )
            } )
    } )
}

gulp.task( 'js:lint', ( cb ) => {
    if ( !checkProcess() ) {
        return cb()
    }

    return gulp.src( jsConfig.paths.src, {
        allowEmpty: true,
    } )
        .pipe( eslint( jsConfig.eslint ) )
        .pipe( eslint.format() )
        .pipe( eslint.failAfterError() )
} )

gulp.task( 'js:compile', ( cb ) => {
    if ( !checkProcess() ) {
        return cb()
    }

    return gulp.src( jsConfig.paths.src, {
        allowEmpty: true,
    } )
        .pipe( plumber() )
        .pipe( filter( [
            '**/*.js',
            '!**/libs/**/*.js',
        ] ) )
        .pipe( compile() )
} )

gulp.task( 'js', gulp.series( 'js:lint', 'js:compile' ) )

gulp.task( 'js:watch', ( cb ) => {
    if ( !checkProcess() || !checkWatch() ) {
        return cb()
    }

    watchLog()

    gulp.watch( [
        ...jsConfig.paths.src,
    ], {
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
                'JS watch failed:', error,
            ], loggerConfig.colors.error, 'error' )
        } )

    return cb()
} )
