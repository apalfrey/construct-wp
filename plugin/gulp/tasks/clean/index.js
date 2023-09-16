// General Gulp Dependencies
const gulp = require( 'gulp' )

global.iLabCompiler.libs.formatConfig( 'clean', require( './samples/config.sample.js' ), false )

const cleanConfig = global.iLabCompiler.config.app.clean
const loggerConfig = global.iLabCompiler.config.app.logger
const loggerColor = loggerConfig.colors.clean || 'red'

function checkProcess() {
    if ( !cleanConfig.process ) {
        global.iLabCompiler.logger.log( 'Cleaning disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function startLog( src ) {
    if ( loggerConfig.fullLog ) {
        global.iLabCompiler.logger.log( [
            'Cleaning:', src,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Cleaning files...', loggerColor )
    }
}

function endLog( src ) {
    if ( loggerConfig.fullLog ) {
        global.iLabCompiler.logger.log( [
            'Completed:', src,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Completed cleaning files', loggerColor )
    }
}

gulp.task( 'clean', ( cb ) => {
    if ( !checkProcess() ) {
        return cb()
    }

    startLog( cleanConfig.paths )

    import( 'del' ).then( ( del ) => {
        del.deleteAsync( cleanConfig.paths, cleanConfig.del )
            .then( () => {
                endLog( cleanConfig.paths )
                cb()
            } )
    } )
} )
