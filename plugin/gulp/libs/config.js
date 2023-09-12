const fs = require( 'node:fs' )
const log = require( 'fancy-log' )

function checkConfig( config, sample ) {
    if ( !fs.existsSync( config ) ) {
        if ( !fs.existsSync( sample ) ) {
            // eslint-disable-next-line unicorn/escape-case
            throw new Error( `\u001b[91mNo config (${config}) or sample(${sample}) available\u001b[0m` )
        }

        // eslint-disable-next-line unicorn/escape-case
        log( `\u001b[32mCreating missing config file: \u001b[1m${config}\u001b[0m` )
        fs.copyFileSync( sample, config )
    }
}

function formatConfig( property, sample, formatPaths = true ) {
    if ( property in global.iLabCompiler.config.app === false ) {
        // Add the sample to the config file
        let content = rtrim( indent( `\n    ${property}: ${sample.toString().slice( 20, sample.toString().length - 3 )}`, 4 ), ',' ) + ','
        addToConfig( content )

        // Add the sample to the global config
        global.iLabCompiler.config.app[property] = sample()
    }

    if ( formatPaths ) {
        global.iLabCompiler.libs.formatPaths( property )
    }

    if ( Object.prototype.hasOwnProperty.call( global.iLabCompiler.config.app[property], 'paths' ) ) {
        global.iLabCompiler.libs.createDirs( property )
    }
}

function addToConfig( content ) {
    const path = './gulp/config/app.js'
    const config = fs.readFileSync( path ).toString()
    let file = fs.openSync( path, 'r+' )
    let buffer = Buffer.from( content + config.slice( -12 ) )
    fs.writeSync( file, buffer, 0, buffer.length, config.length - 12 )
    fs.closeSync( file )
}

function indent( string, width = 4 ) {
    if ( typeof width === 'number' ) {
        width = Array.from( { length: width + 1 } ).join( ' ' )
    }

    return string.replace( /^(?!$)/gm, width )
}

function rtrim( str, chr ) {
    var rgxtrim = ( !chr ) ? /\\s+$/ : new RegExp( chr + '+$' )
    return str.replace( rgxtrim, '' )
}

module.exports = {
    checkConfig,
    formatConfig,
}
