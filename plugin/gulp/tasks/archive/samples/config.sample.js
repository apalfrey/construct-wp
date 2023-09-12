let pkg = require( '../../../../package.json' )
module.exports = () => {
    return {
        process: false,
        archives: [
            {
                paths: {
                    src: [
                        '**/*',
                        '!**/*.zip',
                        '!**/*.zip.gz',
                        '!**/*.tar',
                        '!**/*.tar.gz',
                        '!gulp/**',
                        '!src/**',
                        '!node_modules/**',
                        '!gulpfile.js',
                        '!package.json',
                        '!package-lock.json',
                        '!README.md',
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
    }
}
