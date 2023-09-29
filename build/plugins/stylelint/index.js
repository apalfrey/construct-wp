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

const plugin_name = 'gulp-stylelint'

const reporter = ( reporters, warnings, return_value ) => {
    reporters.forEach( ( reporter ) => {
        const formatted_report = stylelint.formatters[reporter.formatter]( warnings, return_value ).trim()

        if ( reporter.console ) {
            log.info( `\n${formatted_report}\n` )
        }

        if ( reporter.save && reporter.save_dir ) {
            writer( formatted_report, reporter.save, reporter.save_dir )
        }
    } )
}

const writer = ( report, file_name, dir ) => {
    const full_path = path.resolve( dir, file_name )

    fs.mkdir( path.dirname( full_path ), {
        recursive: true,
    }, ( mkdir_error ) => {
        if ( mkdir_error ) {
            this.emit( 'error', new PluginError( plugin_name, 'Unable to create directory for report' ) )
        } else {
            fs.writeFile( full_path, strip_ansi( report ), ( write_error ) => {
                if ( write_error ) {
                    this.emit( 'error', new PluginError( plugin_name, 'Unable to write file' ) )
                }
            } )
        }
    } )
}

function strip_ansi( string ) {
    let ansi_regex = [
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
        '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
    ].join( '|' )
    return string.replace( ansi_regex, '' )
}

module.exports = ( options ) => {
    const promiseList = []

    const full_options = {
        failOnError: false,
        failAfterError: true,
        debug: true,
        reporters: [
            {
                formatter: 'verbose',
                console: true,
                save: false,
                save_dir: false,
            },
        ],
        ...options,
    }

    for ( const formatter in full_options.reporters ) {
        if ( Object.prototype.hasOwnProperty.call( full_options.reporters, formatter ) ) {
            full_options.reporters[formatter] = {
                formatter: 'verbose',
                console: true,
                save: false,
                save_dir: false,
                ...full_options.reporters[formatter],
            }
        }
    }

    const plugin_options = {
        failOnError: full_options.failOnError,
        failAfterError: full_options.failAfterError,
        reporters: full_options.reporters,
        debug: full_options.debug,
    }

    const linter_options = {
        ...full_options,
    }

    delete linter_options.failOnError
    delete linter_options.failAfterError
    delete linter_options.reporters
    delete linter_options.debug

    return transformer( {
        transform( file, enc, cb ) {
            if ( file.isNull() ) {
                cb( null, file )
                return
            }

            if ( file.isStream() ) {
                this.emit( 'error', new PluginError( plugin_name, 'Streaming is not supported' ) )
                cb()
                return
            }

            const lintPromise = stylelint.lint( {
                code: file.contents.toString(),
                codeFilename: file.path,
                ...linter_options,
            } )
                .then( ( response ) => {
                    if ( linter_options.fix && response.output ) {
                        file.contents = Buffer.from( response.output )
                    }

                    if ( Array.isArray( response.results ) && response.results.length > 0 ) {
                        const error_count = response.results[0].warnings.filter( ( warning ) => warning.severity === 'error' ).length

                        if ( !plugin_options.fix && plugin_options.failOnError && error_count > 0 ) {
                            this.emit( 'error', new PluginError( plugin_name, `Failed with ${error_count} ${error_count === 1 ? 'error' : 'errors'}` ) )
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

                    const return_value = {
                        cwd: response[0].cwd,
                        errored,
                        results: [],
                        output: '',
                        reportedDisables: [],
                        ruleMetadata: response[0].ruleMetadata,
                    }

                    reporter( plugin_options.reporters, warnings, return_value )
                    return response
                } )
                .then( ( response ) => {
                    process.nextTick( () => {
                        // if the file was skipped, for example, by .stylelintignore, then res.results will be []
                        const error_count = response.filter( ( res ) => res.results.length ).reduce( ( sum, res ) => {
                            return sum + res.results[0].warnings.filter( ( warning ) => warning.severity === 'error' ).length
                        }, 0 )

                        if ( plugin_options.failAfterError && error_count > 0 ) {
                            this.emit( 'error', new PluginError( plugin_name, `Failed with ${error_count} ${error_count === 1 ? 'error' : 'errors'}` ) )
                        }

                        cb()
                    } )
                } )
                .catch( ( error ) => {
                    this.emit( 'error', new PluginError( plugin_name, error, {
                        showStack: Boolean( plugin_options.debug ),
                    } ) )
                    cb()
                } )
        },
    } )
}
