const stream = require( 'node:stream' )
const buffer = require( 'node:buffer' )
const rollup = require( 'rollup' )

module.exports = ( inputOptions, outputOptions, customRollup = false ) => new stream.Transform( {
    objectMode: true,
    async transform( file, _encoding, done ) {
        if ( file.isNull() ) {
            return done( null, file )
        }

        if ( file.isStream() ) {
            return done( new Error( 'Streams are not supported!' ), file )
        }

        const build = !!customRollup ? await ( 0, customRollup.rollup )( {
            input: file.path,
            ...inputOptions
        } ) : await ( 0, rollup.rollup )( {
            input: file.path,
            ...inputOptions
        } )

        const { output: [chunk] } = await build.generate( {
            sourcemap: Boolean( file.sourceMap ) && 'hidden',
            ...outputOptions
        } )

        const modified = file.clone()
        modified.contents = buffer.Buffer.from( chunk.code )
        modified.sourceMap = chunk.map

        return done( null, modified )
    }
} )
