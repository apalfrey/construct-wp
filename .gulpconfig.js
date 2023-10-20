const pkg = require( './package.json' )
const TerserPlugin = require( 'terser-webpack-plugin' )
const areas = {
    constructWp: {
        path: './plugins/construct-wp',
        name: 'construct-wp',
        title: 'ConstructWP',
        version: '0.2.1',
    },
}

const translatePipes = {
    checktextdomain: {
        text_domain: 'text-domain',
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
        domain: 'text-domain',
        package: 'Package Name',
        team: `${pkg.author.name} <${pkg.author.email}>`,
        lastTranslator: `${pkg.author.name} <${pkg.author.email}>`,
    },
}

module.exports = {
    clean: {
        process: true,
        logColor: 'red',
        paths: [
            `${areas.constructWp.path}/assets`,
            `${areas.constructWp.path}/dist`,
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
    scripts: {
        process: true,
        watch: true,
        logColor: 'magenta',
        areas: [
            {
                paths: {
                    src: `${areas.constructWp.path}/src/js/**/*`,
                    watch: `${areas.constructWp.path}/src/js/**/*`,
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
                        base: `${areas.constructWp.path}/src/js`,
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
                ],
                build: [
                    '**/*.js',
                    '!**/libs/**/*.js',
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
            rollup: {
                // Overrides the version of rollup used.
                // Make sure to pass through the rollup function
                // e.g. require( 'rollup' ).rollup
                rollup: null,
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
        logColor: 'magenta',
        areas: [
            {
                paths: {
                    src: `${areas.constructWp.path}/src/gutenberg/*`,
                    watch: `${areas.constructWp.path}/src/gutenberg/**/*`,
                    dest: `${areas.constructWp.path}/assets/js`,
                },
                minify: {
                    process: false,
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
                                        plugins: [
                                            '@automattic/babel-plugin-preserve-i18n',
                                        ],
                                    },
                                },
                            },
                        ],
                    },
                    resolve: {
                        extensions: ['.js', '.jsx', '.json'],
                    },
                    optimization: {
                        concatenateModules: false,
                        minimizer: [
                            new TerserPlugin( {
                                parallel: true,
                                terserOptions: {
                                    output: {
                                        comments: /translators:/i,
                                    },
                                    compress: {
                                        passes: 2,
                                    },
                                    mangle: {
                                        reserved: [
                                            '__',
                                            '_e',
                                            '_x',
                                            '_ex',
                                            '_n',
                                            '_nx',
                                            '_n_noop',
                                            '_nx_noop',
                                            'esc_html__',
                                            'esc_html_e',
                                            'esc_html_x',
                                            'esc_attr__',
                                            'esc_attr_e',
                                            'esc_attr_x',
                                        ],
                                    },
                                },
                                extractComments: false,
                            } ),
                        ],
                    },
                    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
                    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
                },
            },
            uglify: {
                output: {
                    comments: '/^!|@preserve|@license|@cc_on|translators:/i',
                },
                mangle: {
                    reserved: [
                        '__',
                        '_e',
                        '_x',
                        '_ex',
                        '_n',
                        '_nx',
                        '_n_noop',
                        '_nx_noop',
                        'esc_html__',
                        'esc_html_e',
                        'esc_html_x',
                        'esc_attr__',
                        'esc_attr_e',
                        'esc_attr_x',
                    ],
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
                    checktextdomain: {
                        ...translatePipes.checktextdomain,
                        text_domain: areas.constructWp.name,
                    },
                    pot: {
                        ...translatePipes.pot,
                        domain: areas.constructWp.name,
                        package: areas.constructWp.title,
                        relativeTo: areas.constructWp.path,
                    },
                },
            },
            {
                paths: {
                    src: `${areas.constructWp.path}/assets/js/**/*.js`,
                    watch: `${areas.constructWp.path}/assets/js/**/*.js`,
                    dest: `${areas.constructWp.path}/languages/js/${areas.constructWp.name}.pot`,
                },
                pipes: {
                    // Put any pipe overrides here
                    src: {
                        allowEmpty: true,
                    },
                    dest: {},
                    checktextdomain: {
                        ...translatePipes.checktextdomain,
                        text_domain: areas.constructWp.name,
                    },
                    pot: {
                        ...translatePipes.pot,
                        domain: areas.constructWp.name,
                        package: areas.constructWp.title,
                        relativeTo: areas.constructWp.path,
                        parser: 'js',
                        parserOptions: {
                            ecmaVersion: 9,
                        },
                    },
                },
            },
        ],
        pipes: translatePipes,
    },
    po2json: {
        process: true,
        watch: true,
        paths: [
            `${areas.constructWp.path}/languages/**/*.po`,
        ],
        bin: 'vendor/bin/wp',
        pretty: true,
        execSync: {
            shell: 'C:\\Program Files\\Git\\bin\\bash.exe',
        },
    },
    browsersync: {
        watch: true,
        browsersync: {
            proxy: 'localhost:8000',
            port: 4000,
            ui: false,
            files: [
                'plugins/**/*',
                'themes/**/*',
                '!**/src/**/*',
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
