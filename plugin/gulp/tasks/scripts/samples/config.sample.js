module.exports = () => {
    return {
        paths: [
            {
                src: [
                    './src/js/**/*',
                ],
                dest: './assets/js',
                base: './src/js',
            },
        ],
        process: false,
        watch: true,
        sourcemaps: process.env.NODE_ENV == 'development',
        eslint: {
            warnIgnored: true,
        },
        rollup: {
            plugins: [
                require( '@rollup/plugin-node-resolve' ).nodeResolve(),
                require( '@rollup/plugin-babel' ).babel( {
                    exclude: 'node_modules/**',
                    presets: [
                        '@babel/env',
                    ],
                    babelHelpers: 'bundled',
                    compact: false,
                } ),
            ],
            treeshake: false,
            onwarn( e ) {
                if ( e.code === 'THIS_IS_UNDEFINED' ) {
                    return
                }

                console.warn( e.message )
            },
            output: {
                format: 'es',
            },
        },
        uglify: {
            output: {
                comments: '/^!|@preserve|@license|@cc_on/i',
            },
        },
    }
}
