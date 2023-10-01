module.exports = {
    // Place in your .gulpconfig.js
    webpack: {
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
                // Overrides the version of eslint used
                eslint: null,
                formatter: 'stylish',
                options: {
                    fix: false,
                },
            },
            webpack: {
                externals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
                target: 'browserslist',
                module: {
                    rules: [
                        {
                            test: /\.jsx?$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    presets: [
                                        '@babel/preset-env',
                                        '@babel/preset-react',
                                    ],
                                    plugins: [],
                                },
                            },
                        },
                    ],
                },
                resolve: {
                    extensions: ['.js', '.jsx', '.json'],
                },
                devtool: process.env.NODE_ENV == 'development' ? 'source-map' : false,
                mode: process.env.NODE_ENV == 'development' ? 'development' : 'production',
            },
            uglify: {
                output: {
                    comments: '/^!|@preserve|@license|@cc_on/i',
                },
            },
        },
    },
}