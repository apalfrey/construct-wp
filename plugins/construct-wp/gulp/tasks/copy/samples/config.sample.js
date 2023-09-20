module.exports = () => {
    return {
        paths: [
            {
                src: './src/fonts/**/*',
                dest: './assets/fonts',
                base: './src/fonts',
            },
        ],
        process: false,
        watch: true,
    }
}
