const fs = require( 'node:fs' )
const path = require( 'node:path' )
const gulp = require( 'gulp' )

function requireTasks() {
    let taskDir = path.resolve( './gulp/tasks' )
    fs.readdirSync( taskDir ).forEach( ( file ) => {
        let task = `${taskDir}/${file}`
        if ( fs.statSync( task ).isDirectory() && fs.existsSync( `${task}/index.js` ) ) {
            require( task )
        }
    } )
}

function defineSeries( task, series ) {
    series = formatSeries( series )

    if ( !!series.length ) {
        gulp.task( task, gulp.series( ...series ) )
    }
}

function formatSeries( tasks ) {
    let returnTasks = []

    tasks.forEach( ( task ) => {
        if ( gulp.task( task ) ) {
            returnTasks.push( task )
        }
    } )

    return returnTasks
}

module.exports = {
    requireTasks,
    defineSeries,
    formatSeries,
}
