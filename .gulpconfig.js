const pkg = require( './package.json' )
const areas = {
    constructWp: {
        path: './plugins/construct-wp',
        name: 'construct-wp',
        title: 'ConstructWP',
        version: '0.1.1',
    },
}

module.exports = {
    clean: {
        process: true,
        logColor: 'red',
        paths: [
            `${areas.constructWp.path}/assets`,
            `${areas.constructWp.path}/dist`,
            `${areas.constructWp.path}/languages`,
        ],
        pipes: {
            del: {
                force: true,
            },
        },
    },
    styles: {
        process: true,
        watch: true,
        logColor: 'yellow',
        areas: [
            {
                paths: {
                    src: `${areas.constructWp.path}/src/scss/**/*`,
                    watch: `${areas.constructWp.path}/src/scss/**/*`,
                    dest: `${areas.constructWp.path}/assets/css`,
                },
                minify: {
                    process: process.env.NODE_ENV !== 'development',
                    separate: false,
                },
                pipes: {
                    // Put any pipe overrides here
                    src: {
                        allowEmpty: true,
                        base: `${areas.constructWp.path}/src/scss`,
                        sourcemaps: process.env.NODE_ENV === 'development',
                    },
                    dest: {
                        sourcemaps: '.',
                    },
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
            watch: {
                events: 'all',
            },
            stylelint: {
                // Overrides the version of stylelint used
                stylelint: null,
                options: {
                    formatter: 'verbose',
                },
            },
            sass: {
                // Overrides the version of sass used
                sass: null,
                sync: true,
                options: {
                    style: 'expanded',
                    loadPaths: [
                        '.'
                    ],
                },
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
    webpack: {
        process: true,
        watch: true,
        logColor: 'magenta',
        areas: [
            {
                paths: {
                    src: `${areas.constructWp.path}/src/gutenberg/*`,
                    watch: `${areas.constructWp.path}/src/gutenberg/**/*`,
                    dest: `${areas.constructWp.path}/assets/js`,
                },
                minify: {
                    process: process.env.NODE_ENV !== 'development',
                    separate: false,
                },
                pipes: {
                    // Put any pipe overrides here
                    src: {
                        allowEmpty: true,
                        base: `${areas.constructWp.path}/src/gutenberg`,
                        sourcemaps: process.env.NODE_ENV === 'development',
                    },
                    dest: {
                        sourcemaps: '.',
                    },
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
            watch: {
                events: 'all',
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
                // Overrides the version of webpack used.
                webpack: null,
                options: {
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
                    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
                    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
                },
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
        logColor: 'black',
        areas: [
            {
                paths: {
                    src: `${areas.constructWp.path}/**/*.php`,
                    watch: `${areas.constructWp.path}/**/*.php`,
                    dest: `${areas.constructWp.path}/languages/${areas.constructWp.name}.pot`,
                },
                pipes: {
                    // Put any pipe overrides here
                    src: {
                        allowEmpty: true,
                    },
                    dest: {},
                },
            },
        ],
        pipes: {
            checktextdomain: {
                text_domain: areas.constructWp.name,
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
                domain: areas.constructWp.name,
                package: areas.constructWp.title,
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
                '**/*',
                '!**/src/**/*'
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
                        `${areas.constructWp.path}/**/*`,
                        `!${areas.constructWp.path}/dist/**`,
                        `!${areas.constructWp.path}/src/**`,
                        `!${areas.constructWp.path}/**/*.zip*`,
                        `!${areas.constructWp.path}/**/*.tar`,
                    ],
                    dest: `${areas.constructWp.path}/dist`,
                },
                pipes: {
                    src: {
                        allowEmpty: true,
                        base: './plugins',
                    },
                    dest: {},
                    archiver: {
                        filename: `${areas.constructWp.name}-${areas.constructWp.version}.zip`,
                        format: 'zip',
                        options: {
                            gzip: false,
                        },
                    },
                },
            },
        ],
    },
}
