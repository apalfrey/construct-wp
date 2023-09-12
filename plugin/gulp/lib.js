const requireDir = require( 'require-dir' )

const libs = flattenObject( requireDir( './libs', {
    filter( path ) {
        return !path.endsWith( 'logger.js' )
    },
} ) )

function flattenObject( object, result = {} ) {
    for ( let key in object ) {
        if ( typeof object[key] == 'object' ) {
            flattenObject( object[key], result )
        } else {
            result[key] = object[key]
        }
    }

    return result
}

module.exports = libs
