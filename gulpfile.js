require( 'dotenv' ).config()

const gulp = require( 'gulp' )

require( '@ilabdev/clean' )( gulp )
require( '@ilabdev/styles' )( gulp )
require( '@ilabdev/scripts' )( gulp )
require( '@ilabdev/webpack' )( gulp )
require( '@ilabdev/translate' )( gulp )
require( '@ilabdev/browsersync' )( gulp )
require( '@ilabdev/archive' )( gulp )

const { glob } = require( 'glob' )
const { execSync } = require( 'node:child_process' )
const {
    logger,
} = require( '@ilabdev/utils' )
const config = require( `${process.cwd()}/.gulpconfig.js` ).po2json
const logColor = config.logColor || 'black'

gulp.task( 'translate:json', ( cb ) => {
    if ( config.process ) {
        logger.log( 'Converting PO to JSON...', logColor )
    }

    let files = []

    config.paths.forEach( ( dir ) => {
        files = files.concat( glob( dir, { sync: true, stat: true, withFileTypes: true } ) )
    } )

    files.forEach( ( file ) => {
        execSync( `${config.bin} i18n make-json ${file} --no-purge ${config.pretty ? '--pretty-print' : ''}`, config.execSync )
    } )

    logger.log( 'PO to JSON conversion complete!', logColor )
    return cb()
} )

require( '@ilabdev/default' )( gulp )
