// Local utilities
const logger = require( '@build/utils/log' )

// Config
const config = require( `${process.cwd()}/.gulpconfig.js` ).clean

module.exports = ( {
    task,
} ) => {
    task( 'clean', ( cb ) => {
        if ( config.process ) {
            logger.log( 'Cleaning files...', 'red' )

            import( 'del' ).then( ( del ) => {
                del.deleteAsync( config.paths, config.pipes.del )
                    .then( () => {
                        logger.log( 'Cleaning complete!', 'red' )
                        cb()
                    } )
            } )
        } else {
            logger.disabled( 'Cleaning files' )

            cb()
        }
    } )
}
