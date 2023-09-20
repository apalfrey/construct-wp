module.exports = () => {
    let pkg = require( '../../package.json' )
    return {
        logger: {
            console: true,
            log: false,
            logFile: './gulp/logs/compiler.log',
            fullLog: true,
            colors: {
                error: 'brightRed',
            },
        },
        sourcemaps: {
            init: {
                loadMaps: true,
            },
            write: {
                path: '.',
                options: {
                    includeContent: true,
                },
            },
        },
    }
}
