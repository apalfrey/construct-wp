module.exports = {
    // Place in your .gulpconfig.js
    browsersync: {
        watch: true,
        browsersync: {
            server: {
                baseDir: './'
            },
            ui: false,
            files: [
                '**/*',
            ],
            ghostmode: false,
            open: false,
            notify: true,
            watch: true,
        },
    },
}