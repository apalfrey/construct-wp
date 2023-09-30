// External dependencies
const mergeStream = require( 'merge-stream' )

module.exports = ( config, task, unpipe ) => {
    let streams = mergeStream()
    config.areas.forEach( ( area ) => {
        const pipes = {}

        if ( Object.prototype.hasOwnProperty.call( config, 'pipes' ) ) {
            Object.assign( pipes, config.pipes )
        }

        if ( Object.prototype.hasOwnProperty.call( area, 'pipes' ) ) {
            Object.assign( pipes, area.pipes )
        }

        streams.add( task( area, pipes ) )
    } )

    return streams.on( 'unpipe', () => {
        if ( streams.isEmpty() ) {
            unpipe()
        }
    } )
}