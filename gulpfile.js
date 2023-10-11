require( 'dotenv' ).config()

const gulp = require( 'gulp' )

require( '@ilabdev/clean' )( gulp )
require( '@ilabdev/styles' )( gulp )
require( '@ilabdev/scripts' )( gulp )
require( '@ilabdev/webpack' )( gulp )
require( '@ilabdev/translate' )( gulp )
require( '@ilabdev/browsersync' )( gulp )
require( '@ilabdev/archive' )( gulp )
require( '@ilabdev/default' )( gulp )
