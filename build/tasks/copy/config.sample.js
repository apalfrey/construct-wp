module.exports = {
    // Place in your .gulpconfig.js
    copy: {
        process: true,
        watch: true,
        areas: [
            {
                paths: {
                    src: './src/copy/**/*',
                    watch: './src/copy/**/*',
                    dest: './dist/copy',
                },
                srcOptions: {
                    allowEmpty: true,
                    base: './src/copy',
                },
            },
        ],
    },
}