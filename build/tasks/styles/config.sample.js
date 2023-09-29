module.exports = {
    // Place in your .gulpconfig.js
    styles: {
        process: true,
        watch: true,
        paths: {
            src: './src/scss/styles.scss',
            watch: './src/scss/**/*',
            dest: './dist/css',
        },
        srcOptions: {
            allowEmpty: true,
            base: './src/scss',
            sourcemaps: true,
        },
        destOptions: {
            sourcemaps: '.',
        },
        filters: {
            lint: [
                '**/*.scss',
            ],
            build: [
                '**/*.scss',
                '!**/_*.scss',
            ],
        },
        minify: {
            process: true,
            separate: false,
        },
        pipes: {
            stylelint: {
                failOnError: true,
                failAfterError: false,
                reporters: [
                    {
                        formatter: 'verbose',
                        console: true,
                    },
                ],
            },
            sass: {
                outputStyle: 'expanded',
                errLogToConsole: true,
            },
            postcss() {
                return {
                    plugins: [
                        require( 'autoprefixer' )( {
                            cascade: false,
                        } ),
                    ],
                    options: {},
                }
            },
            cssnano: {
                preset: [
                    'default',
                    {
                        cssDeclarationSorter: false,
                        svgo: false,
                    },
                ],
            },
        },
    },
}