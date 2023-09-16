// General Gulp Dependencies
const gulp = require( 'gulp' )

// Archive Dependencies
const mergeStream = require( 'merge-stream' )
const archiver = require( '@stgdp/gulp-archiver' )

global.iLabCompiler.libs.formatConfig( 'archive', require( './samples/config.sample.js' ), false )

const archiveConfig = global.iLabCompiler.config.app.archive
const loggerConfig = global.iLabCompiler.config.app.logger
const loggerColor = loggerConfig.colors.archive || 'brightBlue'

function checkProcess() {
    if ( !archiveConfig.process ) {
        global.iLabCompiler.logger.log( 'Archiving disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function startLog( src ) {
    if ( loggerConfig.fullLog ) {
        global.iLabCompiler.logger.log( [
            'Archiving:', src,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Archiving files...', loggerColor )
    }
}

function endLog( src ) {
    if ( loggerConfig.fullLog ) {
        global.iLabCompiler.logger.log( [
            'Completed:', src,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Completed archiving files', loggerColor )
    }
}

gulp.task( 'archive', ( cb ) => {
    if ( !checkProcess() ) {
        return cb()
    }

    let streams = mergeStream()
    archiveConfig.archives.forEach( ( archive ) => {
        let filename = archive.filename + ( archive.options.gzip && !archive.filename.endsWith( '.gz' ) ? '.gz' : '' )
        startLog( filename )

        let stream = gulp.src( archive.paths.src, {
            base: archive.paths.base,
            allowEmpty: true,
        } )
            .pipe( archiver( filename, archive.format, archive.options ) )
            .pipe( gulp.dest( archive.paths.dest ) )
            .on( 'end', () => {
                endLog( filename )
            } )

        streams.add( stream )
    } )

    return streams.on( 'unpipe', () => {
        if ( streams.isEmpty() ) {
            return cb()
        }
    } )
} )
