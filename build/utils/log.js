const logger = require( '@stgdp/fancy-logger' )

const log = ( message, color ) => {
    // eslint-disable-next-line no-unused-expressions
    logger( {
        modifiers: {
            fg: color,
        },
    } )
        .write( message )
        .end
}

const error = ( message ) => {
    // eslint-disable-next-line no-unused-expressions
    logger()
        .red
        .write( message )
        .end
}

const disabled = ( task ) => {
    error( `${task} is disabled in .gulpconfig.js` )
}

module.exports = {
    log,
    error,
    disabled,
}
