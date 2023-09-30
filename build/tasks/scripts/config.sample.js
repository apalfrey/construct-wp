module.exports = {
    // Place in your .gulpconfig.js
    scripts: {
        process: true,
        watch: true,
        areas: [
            {
                paths: {
                    src: './src/js/scripts.js',
                    watch: './src/js/**/*',
                    dest: './dist/js',
                },
                srcOptions: {
                    allowEmpty: true,
                    base: './src/js',
                    sourcemaps: true,
                },
                destOptions: {
                    sourcemaps: '.',
                },
                minify: {
                    process: true,
                    separate: false,
                },
                pipes: {
                    // Put any pipe overrides here
                },
            },
        ],
        pipes: {
            filters: {
                lint: [
                    '**/*.js',
                ],
                build: [
                    '**/*.js',
                    '!**/libs/**/*.js',
                ],
            },
            eslint: {
                warnIgnored: true,
            },
            rollup: {
                input: {
                    plugins: [
                        require( '@rollup/plugin-babel' ).babel( {
                            exclude: 'node_modules/**',
                            babelHelpers: 'bundled',
                        } ),
                        require( '@rollup/plugin-node-resolve' ).nodeResolve(),
                    ],
                    treeshake: false,
                    onwarn( e ) {
                        if ( e.code === 'THIS_IS_UNDEFINED' ) {
                            return
                        }

                        console.warn( e.message )
                    },
                },
                output: {
                    file: 'scripts.js',
                    name: 'Scripts',
                    format: 'umd',
                    generatedCode: 'es2015',
                    globals: {},
                },
                external: [],
            },
            uglify: {
                output: {
                    comments: '/^!|@preserve|@license|@cc_on/i',
                },
            },
        },
    },
}