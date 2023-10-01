const { Transform } = require( 'node:stream' )
const { Buffer } = require( 'node:buffer' )
const { rollup } = require( 'rollup' )

module.exports = ( options ) => new Transform( {
    objectMode: true,
    async transform( file, _encoding, done ) {
        if ( file.isNull() ) {
            return done( null, file )
        }

        if ( file.isStream() ) {
            return done( new Error( 'Streams are not supported!' ), file )
        }

        const build = await( 0, options.rollup ? options.rollup : rollup )( {
            input: file.path,
            ...options.input,
        } )

        const { output: [chunk] } = await build.generate( {
            sourcemap: Boolean( file.sourceMap ) && 'hidden',
            ...options.output,
        } )

        const modified = file.clone()
        modified.contents = Buffer.from( chunk.code )
        modified.sourceMap = chunk.map

        return done( null, modified )
    }
} )
