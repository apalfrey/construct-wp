module.exports = () => {
    return {
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
    }
}
