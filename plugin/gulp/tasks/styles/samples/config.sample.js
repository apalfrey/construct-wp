module.exports = () => {
    return {
        paths: [
            {
                src: [
                    './src/scss/**/*',
                ],
                dest: './assets/css',
                base: './src/scss',
            },
        ],
        process: false,
        watch: true,
        sourcemaps: process.env.NODE_ENV == 'development',
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
    }
}
