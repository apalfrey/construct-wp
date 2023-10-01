const pkg = require( './package.json' )

module.exports = {
    clean: {
        process: true,
        paths: [
            './assets',
            './dist',
            './languages',
        ],
        pipes: {
            del: {
                force: true,
            },
        },
    },
    copy: {
        process: false,
        watch: true,
        areas: [
            {
                paths: {
                    src: './src/fonts/**/*',
                    watch: './src/fonts/**/*',
                    dest: './assets/fonts',
                },
                srcOptions: {
                    allowEmpty: true,
                    base: './src/fonts',
                },
            },
        ],
    },
    images: {
        process: false,
        watch: true,
        areas: [
            {
                paths: {
                    src: './src/images/**/*',
                    watch: './src/images/**/*',
                    dest: './assets/images',
                },
                srcOptions: {
                    allowEmpty: true,
                    base: './src/images',
                },
                pipes: {
                    // Put any pipe overrides here
                },
            },
        ],
        pipes: {
            sharp: {
                sharpOptions: {
                    limitInputPixels: false,
                },
                compressOptions: {
                    avif: {
                        quality: 33,
                        effort: 6,
                    },
                    jpeg: {
                        quality: 75,
                        progressive: true,
                        mozjpeg: true,
                    },
                    png: {
                        compressionLevel: 6,
                        progressive: true,
                        quality: 100,
                    },
                    webp: {
                        quality: 75,
                    },
                },
                sizes: [],
            },
            svgo: {
                multipass: true,
                plugins: [
                    'sortAttrs',
                    {
                        name: 'removeViewBox',
                        active: false,
                    },
                    {
                        name: 'cleanupIDs',
                        params: {
                            minify: true,
                        },
                    },
                ],
            },
        },
    },
    styles: {
        process: true,
        watch: true,
        areas: [
            {
                paths: {
                    src: './src/scss/**/*',
                    watch: './src/scss/**/*',
                    dest: './assets/css',
                },
                srcOptions: {
                    allowEmpty: true,
                    base: './src/scss',
                    sourcemaps: true,
                },
                destOptions: {
                    sourcemaps: '.',
                },
                minify: {
                    process: process.env.NODE_ENV !== 'development',
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
                    '**/*.scss',
                ],
                build: [
                    '**/*.scss',
                    '!**/_*.scss',
                ],
            },
            stylelint: {
                // Overrides the version of stylelint used
                stylelint: null,
                options: {
                    formatter: 'verbose',
                },
            },
            sass: {
                outputStyle: 'expanded',
                errLogToConsole: true,
                includePaths: [
                    '../../',
                ],
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
    scripts: {
        process: false,
        watch: true,
        areas: [
            {
                paths: {
                    src: './src/js/**/*',
                    watch: './src/js/**/*',
                    dest: './assets/js',
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
                    process: process.env.NODE_ENV !== 'development',
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
                // Overrides the version of eslint used
                eslint: null,
                formatter: 'stylish',
                options: {
                    fix: false,
                },
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
                    treeshake: true,
                    onwarn( e ) {
                        if ( e.code === 'THIS_IS_UNDEFINED' ) {
                            return
                        }

                        console.warn( e.message )
                    },
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
        },
    },
    webpack: {
        process: true,
        watch: true,
        areas: [
            {
                paths: {
                    src: './src/gutenberg/*',
                    watch: './src/gutenberg/**/*',
                    dest: './assets/js',
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
                    process: process.env.NODE_ENV !== 'development',
                    separate: false,
                },
            },
        ],
        pipes: {
            filters: {
                lint: [
                    '**/*.js',
                    '**/*.jsx',
                ],
                build: [
                    '**/*.js',
                    '**/*.jsx',
                    '!**/libs/**/*',
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
                    wp: 'wp',
                    '@wordpress': 'wp',
                    '@wordpress/blocks': 'wp.blocks',
                    '@wordpress/block-editor': 'wp.blockEditor',
                    '@wordpress/components': 'wp.components',
                    '@wordpress/data': 'wp.data',
                    '@wordpress/edit-post': 'wp.editPost',
                    '@wordpress/element': 'wp.element',
                    '@wordpress/hooks': 'wp.hooks',
                    '@wordpress/i18n': 'wp.i18n',
                    '@wordpress/notices': 'wp.notices',
                    '@wordpress/plugins': 'wp.plugins',
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
                                        [
                                            '@babel/preset-react',
                                            {
                                                pragma: 'wp.element.createElement',
                                            },
                                        ],
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
    translate: {
        process: true,
        watch: true,
        areas: [
            {
                paths: {
                    src: './**/*.php',
                    watch: './**/*.php',
                    dest: `./languages/${pkg.name}.pot`,
                },
                srcOptions: {
                    allowEmpty: true,
                },
                pipes: {
                    // Put any pipe overrides here
                },
            },
        ],
        pipes: {
            checktextdomain: {
                text_domain: pkg.name,
                keywords: [
                    '__:1,2d',
                    '_e:1,2d',
                    '_x:1,2c,3d',
                    '_ex:1,2c,3d',
                    '_n:1,2,4d',
                    '_nx:1,2,4c,5d',
                    '_n_noop:1,2,3d',
                    '_nx_noop:1,2,3c,4d',
                    'esc_html__:1,2d',
                    'esc_html_e:1,2d',
                    'esc_html_x:1,2c,3d',
                    'esc_attr__:1,2d',
                    'esc_attr_e:1,2d',
                    'esc_attr_x:1,2c,3d',
                ],
                report_missing: true,
                report_success: false,
                report_variable_domain: true,
                correct_domain: true,
                create_report_file: false,
                force: false,
            },
            pot: {
                domain: pkg.name,
                package: 'Construct WP',
                lastTranslator: `${pkg.author.name} <${pkg.author.email}>`,
                headers: {
                    'Language-Team': `${pkg.author.name} <${pkg.author.email}>`,
                },
            },
        },
    },
    browsersync: {
        watch: true,
        browsersync: {
            proxy: 'localhost:8000',
            port: 4000,
            ui: false,
            files: [
                '**/*.*',
            ],
            ghostmode: false,
            open: false,
            notify: true,
            watch: true,
        },
    },
    archive: {
        process: true,
        areas: [
            {
                paths: {
                    src: [
                        '**/*',
                        '!dist/**',
                        '!src/**',
                        '!**/*.zip*',
                        '!**/*.tar',
                    ],
                    dest: './dist',
                },
                srcOptions: {
                    allowEmpty: true,
                    base: '../',
                },
                filename: `${pkg.name}-${pkg.version}.zip`,
                format: 'zip',
                options: {
                    gzip: false,
                },
            },
        ],
    },
}
