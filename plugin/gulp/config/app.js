/* eslint-disable camelcase */
module.exports = () => {
    let pkg = require( '../../package.json' )
    return {
        logger: {
            console: true,
            log: false,
            logFile: './gulp/logs/compiler.log',
            fullLog: true,
            colors: {
                error: 'brightRed',
            },
        },
        sourcemaps: {
            init: {
                loadMaps: true,
            },
            write: {
                path: '.',
                options: {
                    includeContent: true,
                },
            },
        },
        archive: {
            process: true,
            archives: [
                {
                    paths: {
                        src: [
                            '**/*',
                            '!dist/**',
                            '!.vscode/**',
                            '!gulp/**',
                            '!node_modules/**',
                            '!src/**',
                            '!.browserslistrc',
                            '!.env',
                            '!.eslintignore',
                            '!.eslintrc',
                            '!.gitignore',
                            '!.stylelintignore',
                            '!.stylelintrc',
                            '!gulpfile.js',
                            '!package.json',
                            '!README.md',
                            '!yarn.lock',
                        ],
                        base: '../',
                        dest: './dist',
                    },
                    filename: `${pkg.name}-${pkg.version}.zip`,
                    format: 'zip',
                    options: {
                        gzip: false,
                    },
                },
            ],
        },
        clean: {
            paths: [
                './assets',
                './dist',
                './languages',
            ],
            process: true,
            del: {
                force: true,
            },
        },
        copy: {
            paths: [
                {
                    src: './src/copy/**/*',
                    dest: './assets/copy',
                    base: './src/copy',
                },
            ],
            process: false,
            watch: true,
        },
        js: {
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
                treeshake: true,
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
        },
        css: {
            paths: [
                {
                    src: [
                        './src/scss/**/*',
                    ],
                    dest: './assets/css',
                    base: './src/scss',
                },
            ],
            process: true,
            watch: true,
            sourcemaps: process.env.NODE_ENV == 'development',
            stylelint: {
                fix: false,
                reporters: [
                    {
                        formatter: 'verbose',
                        console: true,
                    },
                ],
                debug: false,
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
        translate: {
            paths: {
                src: [
                    './**/*.php',
                    '!./node_modules/**/*',
                ],
                dest: `./languages/${pkg.name}.pot`,
            },
            process: true,
            watch: true,
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
        images: {
            paths: [
                {
                    src: './src/images/**/*',
                    dest: './assets/images',
                    base: './src/images',
                },
            ],
            process: false,
            watch: true,
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
        webpack: {
            paths: [
                {
                    src: './src/gutenberg/index.js',
                    watch: [
                        './src/gutenberg/**/*.js',
                        './src/gutenberg/**/*.jsx',
                        './src/gutenberg/**/*.json',
                    ],
                    dest: './assets/js',
                    base: './src/gutenberg',
                },
            ],
            process: true,
            watch: true,
            eslint: {
                warnIgnored: true,
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
    }
}
/* eslint-enable camelcase */
