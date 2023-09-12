// Core Dependencies
const fs = require( 'node:fs' )

// General Gulp Dependencies
const gulp = require( 'gulp' )
const plumber = require( 'gulp-plumber' )
const through = require( 'through2' )

global.iLabCompiler.libs.formatConfig( 'copy', require( './samples/config.sample.js' ) )

const copyConfig = global.iLabCompiler.config.app.copy
const loggerConfig = global.iLabCompiler.config.app.logger
const loggerColor = loggerConfig.colors.copy || 'cyan'

function checkProcess() {
    if ( !copyConfig.process ) {
        global.iLabCompiler.logger.log( 'Copying files disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function checkWatch() {
    if ( !copyConfig.watch ) {
        global.iLabCompiler.logger.log( 'Watching files for copy disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function startLog( src, dest ) {
    if ( loggerConfig.full_log ) {
        global.iLabCompiler.logger.log( [
            'Copying:', src, '->', dest,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Copying files...', loggerColor )
    }
}

function endLog( src, dest ) {
    if ( loggerConfig.full_log ) {
        global.iLabCompiler.logger.log( [
            'Completed:', src, '->', dest,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Completed copying files', loggerColor )
    }
}

function watchLog() {
    global.iLabCompiler.logger.log( 'Watching files for copying...', loggerColor )
}

function copy() {
    return through.obj( ( file, enc, cb ) => {
        if ( !checkProcess() || !file.isBuffer() ) {
            return cb( null, file )
        }

        let paths = {
            src: global.iLabCompiler.libs.relativeSrc( file.path ),
            area: global.iLabCompiler.libs.getArea( global.iLabCompiler.libs.relativeSrc( file.path ), copyConfig.paths.areas ),
        }

        startLog( paths.src, paths.area.dest )

        gulp.src( paths.src, {
            base: paths.area.base,
        } )
            .pipe( plumber() )
            .pipe( gulp.dest( paths.area.dest ) )
            .on( 'finish', () => {
                endLog( paths.src, paths.area.dest )
                return cb( null, file )
            } )
    } )
}

gulp.task( 'copy', ( cb ) => {
    if ( !checkProcess() ) {
        return cb()
    }

    return gulp.src( copyConfig.paths.src, {
        allowEmpty: true,
    } )
        .pipe( plumber() )
        .pipe( copy() )
} )

gulp.task( 'copy:watch', ( cb ) => {
    if ( !checkProcess() || !checkWatch() ) {
        return cb()
    }

    watchLog()

    gulp.watch( copyConfig.paths.src, {
        allowEmpty: true,
    } )
        .on( 'add', ( file ) => {
            if ( fs.existsSync( file ) && fs.statSync( file ).isFile() ) {
                return gulp.src( file )
                    .pipe( plumber() )
                    .pipe( copy() )
            }
        } )
        .on( 'change', ( file ) => {
            if ( fs.existsSync( file ) && fs.statSync( file ).isFile() ) {
                return gulp.src( file )
                    .pipe( plumber() )
                    .pipe( copy() )
            }
        } )
        // TODO add on delete?
        .on( 'error', ( error ) => {
            global.iLabCompiler.logger.log( [
                'Copy watch failed:', error,
            ], loggerConfig.colors.error, 'error' )
        } )

    return cb()
} )
