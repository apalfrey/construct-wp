module.exports = ( {
    task,
    series,
} ) => {
    const formatTasks = ( tasks ) => {
        let formattedTasks = []

        tasks.forEach( ( taskName ) => {
            if ( task( taskName ) ) {
                formattedTasks.push( taskName )
            }
        } )

        return formattedTasks
    }

    const buildTasks = formatTasks( [
        'clean',
        'copy',
        'images',
        'styles',
        'scripts',
        'webpack',
        'translate',
        'archive',
    ] )

    if ( buildTasks.length ) {
        task( 'build', series( ...buildTasks ) )
    }

    const watchTasks = formatTasks( [
        'copy:watch',
        'images:watch',
        'styles:watch',
        'scripts:watch',
        'webpack:watch',
        'translate:watch',
        'browsersync',
    ] )

    if ( watchTasks.length ) {
        task( 'watch', series( ...watchTasks ) )
    }

    const defaultTasks = formatTasks( [
        'build',
        'watch',
    ] )

    if ( defaultTasks.length ) {
        task( 'default', series( ...defaultTasks ) )
    }
}
