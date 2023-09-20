// General Gulp Dependencies
const gulp = require( 'gulp' )
const plumber = require( 'gulp-plumber' )
const sort = require( 'gulp-sort' )

// Translate Dependencies
const checktextdomain = require( 'gulp-checktextdomain' )
const pot = require( 'gulp-wp-pot' )

global.iLabCompiler.libs.formatConfig( 'translate', require( './samples/config.sample.js' ), false )

const translateConfig = global.iLabCompiler.config.app.translate
const loggerConfig = global.iLabCompiler.config.app.logger
const loggerColor = loggerConfig.colors.translate || 'brightBlack'

function checkProcess() {
    if ( !translateConfig.process ) {
        global.iLabCompiler.logger.log( 'Translating disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function checkWatch() {
    if ( !translateConfig.watch ) {
        global.iLabCompiler.logger.log( 'Watching PHP for translate disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function startLog( type ) {
    if ( type == 'checktextdomain' ) {
        global.iLabCompiler.logger.log( 'Checking text domains...', loggerColor )
    } else if ( type == 'translate' ) {
        global.iLabCompiler.logger.log( 'Translating...', loggerColor )
    }
}

function endLog( type ) {
    if ( type == 'checktextdomain' ) {
        global.iLabCompiler.logger.log( 'Completed checking text domains', loggerColor )
    } else if ( type == 'translate' ) {
        global.iLabCompiler.logger.log( 'Completed translating...', loggerColor )
    }
}

function watchLog() {
    global.iLabCompiler.logger.log( 'Watching PHP files for translating...', loggerColor )
}

gulp.task( 'checktextdomain', ( cb ) => {
    if ( !checkProcess() ) {
        return cb()
    }

    startLog( 'checktextdomain' )

    return gulp.src( translateConfig.paths.src, {
        allowEmpty: true,
    } )
        .pipe( plumber() )
        .pipe( sort() )
        .pipe( checktextdomain( translateConfig.checktextdomain ) )
        .on( 'finish', () => {
            endLog( 'checktextdomain' )
        } )
} )

gulp.task( 'translate', ( cb ) => {
    if ( !checkProcess() ) {
        return cb()
    }

    startLog( 'translate' )

    return gulp.src( translateConfig.paths.src, {
        allowEmpty: true,
    } )
        .pipe( plumber() )
        .pipe( sort() )
        .pipe( pot( translateConfig.pot ) )
        .pipe( gulp.dest( translateConfig.paths.dest ) )
        .on( 'finish', () => {
            endLog( 'translate' )
        } )
} )

gulp.task( 'translate:watch', ( cb ) => {
    if ( !checkProcess() || !checkWatch() ) {
        return cb()
    }

    watchLog()

    gulp.watch( translateConfig.paths.src, {
        allowEmpty: true,
    } )
        .on( 'change', () => {
            startLog( 'translate' )

            return gulp.src( translateConfig.paths.src )
                .pipe( plumber() )
                .pipe( sort() )
                .pipe( checktextdomain( translateConfig.checktextdomain ) )
                .pipe( pot( translateConfig.pot ) )
                .pipe( gulp.dest( translateConfig.paths.dest ) )
                .on( 'finish', () => {
                    endLog( 'translate' )
                } )
        } )
        .on( 'unlink', () => {
            startLog( 'translate' )

            return gulp.src( translateConfig.paths.src )
                .pipe( plumber() )
                .pipe( sort() )
                .pipe( checktextdomain( translateConfig.checktextdomain ) )
                .pipe( pot( translateConfig.pot ) )
                .pipe( gulp.dest( translateConfig.paths.dest ) )
                .on( 'finish', () => {
                    endLog( 'translate' )
                } )
        } )
        .on( 'error', ( error ) => {
            global.iLabCompiler.logger.log( [
                'Translate watch failed:', error,
            ], loggerConfig.colors.error, 'error' )
        } )

    return cb()
} )
