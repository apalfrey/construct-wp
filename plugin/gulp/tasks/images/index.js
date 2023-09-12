// Core Dependencies
const fs = require( 'node:fs' )

// General Gulp Dependencies
const gulp = require( 'gulp' )
const plumber = require( 'gulp-plumber' )
const through = require( 'through2' )

// Image Dependencies
const mimeTypes = require( 'mime-types' )
const sharp = require( 'gulp-optimize-images' )
const svgo = require( 'gulp-svgmin' )

global.iLabCompiler.libs.formatConfig( 'images', require( './samples/config.sample.js' ) )

const imageConfig = global.iLabCompiler.config.app.images
const loggerConfig = global.iLabCompiler.config.app.logger
const loggerColor = loggerConfig.colors.images || 'brightGreen'
const copyColor = loggerConfig.colors.copy || 'cyan'

function checkProcess() {
    if ( !imageConfig.process ) {
        global.iLabCompiler.logger.log( 'Optimizing images disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function checkWatch() {
    if ( !imageConfig.watch ) {
        global.iLabCompiler.logger.log( 'Watching images for optimization disabled in the app config', loggerConfig.colors.error )
        return false
    }

    return true
}

function startLog( src, dest ) {
    if ( loggerConfig.full_log ) {
        global.iLabCompiler.logger.log( [
            'Optimizing:', src, '->', dest,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Optimizing images...', loggerColor )
    }
}

function endLog( src, dest ) {
    if ( loggerConfig.full_log ) {
        global.iLabCompiler.logger.log( [
            'Completed:', src, '->', dest,
        ], loggerColor )
    } else {
        global.iLabCompiler.logger.log( 'Completed optimizing images', loggerColor )
    }
}

function watchLog() {
    global.iLabCompiler.logger.log( 'Watching images for optimization...', loggerColor )
}

function noOptimizeStartLog( src, dest ) {
    if ( loggerConfig.full_log ) {
        global.iLabCompiler.logger.log( `Cannot optimize ${src}, copying to ${dest} instead`, copyColor )
    }
}

function noOptimizeEndLog( src, dest ) {
    if ( loggerConfig.full_log ) {
        global.iLabCompiler.logger.log( [
            'Completed:', src, '->', dest,
        ], copyColor )
    }
}

function optimize() {
    return through.obj( ( file, enc, cb ) => {
        if ( !checkProcess() || !file.isBuffer() ) {
            return cb( null, file )
        }

        let paths = {
            src: global.iLabCompiler.libs.relativeSrc( file.path ),
            area: global.iLabCompiler.libs.getArea( global.iLabCompiler.libs.relativeSrc( file.path ), imageConfig.paths.areas ),
        }

        const mime = mimeTypes.lookup( file.path )

        switch ( mime ) {
            case 'image/avif':
            case 'image/jpeg':
            case 'image/png':
            case 'image/webp':
                startLog( paths.src, paths.area.dest )

                gulp.src( paths.src, {
                    base: paths.area.base,
                } )
                    .pipe( plumber() )
                    .pipe( sharp( imageConfig.sharp ) )
                    .pipe( gulp.dest( paths.area.dest ) )
                    .on( 'finish', () => {
                        endLog( paths.src, paths.area.dest )
                        return cb( null, file )
                    } )
                break
            case 'image/svg+xml':
                startLog( paths.src, paths.area.dest )

                gulp.src( paths.src, {
                    base: paths.area.base,
                } )
                    .pipe( plumber() )
                    .pipe( svgo( imageConfig.svgo ) )
                    .pipe( gulp.dest( paths.area.dest ) )
                    .on( 'finish', () => {
                        endLog( paths.src, paths.area.dest )
                        return cb( null, file )
                    } )
                break
            default:
                noOptimizeStartLog( paths.src, paths.area.dest )

                gulp.src( paths.src, {
                    base: paths.area.base,
                } )
                    .pipe( plumber() )
                    .pipe( gulp.dest( paths.area.dest ) )
                    .on( 'finish', () => {
                        noOptimizeEndLog( paths.src, paths.area.dest )
                        return cb( null, file )
                    } )
                break
        }
    } )
}

gulp.task( 'images', ( cb ) => {
    if ( !checkProcess() ) {
        return cb()
    }

    return gulp.src( imageConfig.paths.src, {
        allowEmpty: true,
    } )
        .pipe( plumber() )
        .pipe( optimize() )
} )

gulp.task( 'images:watch', ( cb ) => {
    if ( !checkProcess() || !checkWatch() ) {
        return cb()
    }

    watchLog()

    gulp.watch( imageConfig.paths.src, {
        allowEmpty: true,
    } )
        .on( 'add', ( file ) => {
            if ( fs.existsSync( file ) && fs.statSync( file ).isFile() ) {
                return gulp.src( file )
                    .pipe( plumber() )
                    .pipe( optimize() )
            }
        } )
        .on( 'change', ( file ) => {
            if ( fs.existsSync( file ) && fs.statSync( file ).isFile() ) {
                return gulp.src( file )
                    .pipe( plumber() )
                    .pipe( optimize() )
            }
        } )
        // TODO add on delete?
        .on( 'error', ( error ) => {
            global.iLabCompiler.logger.log( [
                'Image watch failed:', error,
            ], loggerConfig.colors.error, 'error' )
        } )

    return cb()
} )
