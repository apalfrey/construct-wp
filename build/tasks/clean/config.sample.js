module.exports = {
    // Place in your .gulpconfig.js
    clean: {
        process: true,
        paths: [
            './dist',
        ],
        pipes: {
            del: {
                force: true,
            },
        },
    },
}