require( 'dotenv' ).config()

const libs = require( './gulp/lib.js' )

libs.checkConfig( './gulp/config/app.js', './gulp/libs/samples/app.sample.js' )

global.iLabCompiler = {
    config: {
        app: require( './gulp/config/app.js' )(),
    },
    libs,
}

global.iLabCompiler.logger = require( './gulp/libs/logger.js' )

libs.requireTasks()

libs.defineSeries( 'process', [
    'clean',
    'copy',
    'images',
    'css',
    'js',
    'webpack',
    'checktextdomain',
    'translate',
    'archive',
] )

libs.defineSeries( 'watch', [
    'copy:watch',
    'images:watch',
    'css:watch',
    'js:watch',
    'webpack:watch',
    'ftp:watch',
    'translate:watch',
] )

libs.defineSeries( 'default', [
    'process',
    'watch',
] )
