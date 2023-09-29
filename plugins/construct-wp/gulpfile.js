require( 'dotenv' ).config()

const gulp = require( 'gulp' )

require( '@build/clean' )( gulp )
// require( '@build/copy' )( gulp )
// require( '@build/images' )( gulp )
require( '@build/styles' )( gulp )
// require( '@build/scripts' )( gulp )
require( '@build/webpack' )( gulp )
require( '@build/translate' )( gulp )
require( '@build/browsersync' )( gulp )
require( '@build/archive' )( gulp )
require( '@build/default' )( gulp )
