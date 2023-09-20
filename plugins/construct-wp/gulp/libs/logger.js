const fs = require( 'node:fs' )
const path = require( 'node:path' )
const through = require( 'through2' )
const fancylog = require( 'fancy-log' )

const loggerConfig = global.iLabCompiler.config.app.logger || {
    console: true,
    log: false,
    logFile: './gulp/logs/compiler.log',
    fullLog: true,
    colors: {
        error: 'brightRed',
    },
}

let direct = true

/* eslint-disable unicorn/escape-case */
const ansi = {
    // Modifiers
    reset: '\u001b[0m',
    bold: '\u001b[1m',
    dim: '\u001b[2m',
    italic: '\u001b[3m',
    underline: '\u001b[4m',
    inverse: '\u001b[7m',
    hidden: '\u001b[8m',
    strike: '\u001b[9m',
    frame: '\u001b[51m',
    encircle: '\u001b[52m',
    overline: '\u001b[53m',
    // FG colors
    black: '\u001b[30m',
    red: '\u001b[31m',
    green: '\u001b[32m',
    yellow: '\u001b[33m',
    blue: '\u001b[34m',
    magenta: '\u001b[35m',
    cyan: '\u001b[36m',
    white: '\u001b[37m',
    // FG colors - Bright
    brightBlack: '\u001b[90m',
    brightRed: '\u001b[91m',
    brightGreen: '\u001b[92m',
    brightYellow: '\u001b[93m',
    brightBlue: '\u001b[94m',
    brightMagenta: '\u001b[95m',
    brightCyan: '\u001b[96m',
    brightWhite: '\u001b[97m',
    // BG colors
    bgBlack: '\u001b[40m',
    bgRed: '\u001b[41m',
    bgGreen: '\u001b[42m',
    bgYellow: '\u001b[43m',
    bgBlue: '\u001b[44m',
    bgMagenta: '\u001b[45m',
    bgCyan: '\u001b[46m',
    bgWhite: '\u001b[47m',
    // BG colors - Bright
    bgBrightBlack: '\u001b[100m',
    bgBrightRed: '\u001b[101m',
    bgBrightGreen: '\u001b[102m',
    bgBrightYellow: '\u001b[103m',
    bgBrightBlue: '\u001b[104m',
    bgBrightMagenta: '\u001b[105m',
    bgBrightCyan: '\u001b[106m',
    bgBrightWhite: '\u001b[107m',
}
/* eslint-enable unicorn/escape-case */

function generateLog( items ) {
    let log = ''

    if ( typeof items === 'string' ) {
        log += items + ' '
    } else {
        items.forEach( ( item ) => {
            log += item

            if ( !item.includes( '%1B' ) ) {
                log += ' '
            }
        } )
    }

    return log
}

function getTimestamp() {
    let time = new Date()
    return '[' +
        ( '0' + time.getHours() ).slice( -2 ) + ':' +
        ( '0' + time.getMinutes() ).slice( -2 ) + ':' +
        ( '0' + time.getSeconds() ).slice( -2 ) +
        '] '
}

function consoleLog( items, color = 'white', type = 'log' ) {
    let log = ansi[color] + generateLog( items ) + ansi.reset

    switch ( type ) {
        case 'error':
            fancylog.error( log )
            break
        case 'warn':
            fancylog.warn( log )
            break
        case 'info':
            fancylog.info( log )
            break
        case 'dir':
            fancylog.dir( log )
            break
        default:
            fancylog( log )
            break
    }

    if ( direct ) {
        return through.obj( ( file, enc, cb ) => {
            return cb( null, file )
        } )
    }
}

function stripAnsi( string ) {
    let ansiRegex = [
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
        '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
    ].join( '|' )
    return string.replace( ansiRegex, '' )
}

function logFile( items, type = 'log' ) {
    fs.mkdirSync( path.dirname( loggerConfig.logFile ), {
        recursive: true,
    } )

    let log = stripAnsi( generateLog( items ) )
    let logFile = fs.createWriteStream( loggerConfig.logFile, {
        flags: 'a',
    } )

    log = getTimestamp() + type.toUpperCase() + ': ' + log.trim() + '\n'

    logFile.write( log )
    logFile.close()

    if ( direct ) {
        return through.obj( ( file, enc, cb ) => {
            return cb( null, file )
        } )
    }
}

function log( items, color = 'white', type = 'log' ) {
    direct = false

    if ( loggerConfig.console ) {
        consoleLog( items, color, type )
    }

    if ( loggerConfig.log ) {
        logFile( items, type )
    }

    return through.obj( ( file, enc, cb ) => {
        return cb( null, file )
    } )
}

module.exports = {
    console: consoleLog,
    logFile,
    log,
    ansi,
}
