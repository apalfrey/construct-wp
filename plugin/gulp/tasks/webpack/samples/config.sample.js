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
        eslint: {
            warnIgnored: true,
        },
        webpack: {
            module: {
                rules: [
                    {
                        test: /\.(js|jsx)$/,
                        use: {
                            loader: 'babel-loader',
                        },
                        exclude: /(node_modules|bower_components)/,
                    },
                ],
            },
            devtool: 'source-map',
        },
        uglify: {
            output: {
                comments: '/^!|@preserve|@license|@cc_on/i',
            },
        },
    }
}
