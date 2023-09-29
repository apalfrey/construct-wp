module.exports = {
    // Place in your .gulpconfig.js
    images: {
        process: true,
        watch: true,
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
}