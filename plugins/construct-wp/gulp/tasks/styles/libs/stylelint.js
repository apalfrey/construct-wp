const stylelint = require( 'stylelint' )
const PluginError = require( 'plugin-error' )
const log = require( 'fancy-log' )

// Core dependencies
const fs = require( 'node:fs' )
const path = require( 'node:path' )
const { Transform } = require( 'node:stream' )

const transformer = ( options ) => {
    return new Transform( {
        objectMode: true,
        ...options,
    } )
}

const PLUGIN_NAME = 'gulp-stylelint'

const reporter = ( reporters, warnings, returnValue ) => {
    reporters.forEach( ( reporter ) => {
        const formattedReport = stylelint.formatters[reporter.formatter]( warnings, returnValue ).trim()

        if ( reporter.console ) {
            log.info( `\n${formattedReport}\n` )
        }

        if ( reporter.save && reporter.save_dir ) {
            writer( formattedReport, reporter.save, reporter.save_dir )
        }
    } )
}

const writer = ( report, fileName, dir ) => {
    const fullPath = path.resolve( dir, fileName )

    fs.mkdir( path.dirname( fullPath ), {
        recursive: true,
    }, ( mkdirError ) => {
        if ( mkdirError ) {
            this.emit( 'error', new PluginError( PLUGIN_NAME, 'Unable to create directory for report' ) )
        } else {
            fs.writeFile( fullPath, stripAnsi( report ), ( writeError ) => {
                if ( writeError ) {
                    this.emit( 'error', new PluginError( PLUGIN_NAME, 'Unable to write file' ) )
                }
            } )
        }
    } )
}

function stripAnsi( string ) {
    let ansiRegex = [
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
        '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
    ].join( '|' )
    return string.replace( ansiRegex, '' )
}

module.exports = ( options ) => {
    const promiseList = []

    const fullOptions = {
        failOnError: false,
        failAfterError: true,
        debug: true,
        reporters: [
            {
                formatter: 'verbose',
                console: true,
                save: false,
                // eslint-disable-next-line camelcase
                save_dir: false,
            },
        ],
        ...options,
    }

    for ( const formatter in fullOptions.reporters ) {
        if ( Object.prototype.hasOwnProperty.call( fullOptions.reporters, formatter ) ) {
            fullOptions.reporters[formatter] = {
                formatter: 'verbose',
                console: true,
                save: false,
                // eslint-disable-next-line camelcase
                save_dir: false,
                ...fullOptions.reporters[formatter],
            }
        }
    }

    const pluginOptions = {
        failOnError: fullOptions.failOnError,
        failAfterError: fullOptions.failAfterError,
        reporters: fullOptions.reporters,
        debug: fullOptions.debug,
    }

    const linterOptions = {
        ...fullOptions,
    }

    delete linterOptions.failOnError
    delete linterOptions.failAfterError
    delete linterOptions.reporters
    delete linterOptions.debug

    return transformer( {
        transform( file, enc, cb ) {
            if ( file.isNull() ) {
                cb( null, file )
                return
            }

            if ( file.isStream() ) {
                this.emit( 'error', new PluginError( PLUGIN_NAME, 'Streaming is not supported' ) )
                cb()
                return
            }

            const lintPromise = stylelint.lint( {
                code: file.contents.toString(),
                codeFilename: file.path,
                ...linterOptions,
            } )
                .then( ( response ) => {
                    if ( linterOptions.fix && response.output ) {
                        file.contents = Buffer.from( response.output )
                    }

                    if ( Array.isArray( response.results ) && response.results.length > 0 ) {
                        const errorCount = response.results[0].warnings.filter( ( warning ) => warning.severity === 'error' ).length

                        if ( !pluginOptions.fix && pluginOptions.failOnError && errorCount > 0 ) {
                            this.emit( 'error', new PluginError( PLUGIN_NAME, `Failed with ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}` ) )
                        }
                    }

                    cb( null, file )
                    return response
                } )
                .catch( ( error ) => {
                    cb( null, file )
                    return Promise.reject( error )
                } )

            promiseList.push( lintPromise )
        }, flush( cb ) {
            Promise.all( promiseList )
                .then( ( response ) => {
                    let warnings = []
                    response.forEach( ( res ) => {
                        warnings = warnings.concat( res.results )
                    } )

                    const errored = warnings.some(
                        ( result ) =>
                            result.errored ||
                            result.parseErrors.length > 0 ||
                            result.warnings.some( ( warning ) => warning.severity === 'error' )
                    )

                    const returnValue = {
                        cwd: response[0].cwd,
                        errored,
                        results: [],
                        output: '',
                        reportedDisables: [],
                        ruleMetadata: response[0].ruleMetadata,
                    }

                    reporter( pluginOptions.reporters, warnings, returnValue )
                    return response
                } )
                .then( ( response ) => {
                    process.nextTick( () => {
                        // if the file was skipped, for example, by .stylelintignore, then res.results will be []
                        const errorCount = response.filter( ( res ) => res.results.length ).reduce( ( sum, res ) => {
                            return sum + res.results[0].warnings.filter( ( warning ) => warning.severity === 'error' ).length
                        }, 0 )

                        if ( pluginOptions.failAfterError && errorCount > 0 ) {
                            this.emit( 'error', new PluginError( PLUGIN_NAME, `Failed with ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}` ) )
                        }

                        cb()
                    } )
                } )
                .catch( ( error ) => {
                    this.emit( 'error', new PluginError( PLUGIN_NAME, error, {
                        showStack: Boolean( pluginOptions.debug ),
                    } ) )
                    cb()
                } )
        },
    } )
}
