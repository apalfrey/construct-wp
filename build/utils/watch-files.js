module.exports = ( areas ) => {
    let watchFiles = []

    areas.forEach( ( area ) => {
        if ( Array.isArray( area.paths.watch ) ) {
            watchFiles.push( ...area.paths.watch )
        } else {
            watchFiles.push( area.paths.watch )
        }
    } )

    watchFiles = [...new Set( watchFiles )]

    return watchFiles
}
