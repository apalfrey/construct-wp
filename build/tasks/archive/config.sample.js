module.exports = {
    // Place in your .gulpconfig.js
    archive: {
        process: true,
        paths: {
            src: [
                '**/*',
                '!**/*.zip*',
                '!**/*.tar',
            ],
            dest: './dist',
        },
        srcOptions: {
            allowEmpty: true,
            base: './',
        },
        filename: `PACKAGE-1.0.0.zip`,
        format: 'zip',
        options: {
            gzip: false,
        },
    },
}
