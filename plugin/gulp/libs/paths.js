// Core Dependencies
const fs = require( 'node:fs' )
const path = require( 'node:path' )

// External Dependencies
const micromatch = require( 'micromatch' )
const parseGlob = require( 'parse-glob' )

function getAllSrc( areas ) {
    var allSrc = []

    areas.forEach( ( area ) => {
        allSrc = allSrc.concat( area.src )
    } )

    return allSrc
}

function relativeSrc( filePath ) {
    return './' + path.normalize( path.relative( process.cwd(), filePath ) ).replace( /\\/g, '/' )
}

function getArea( filePath, areas ) {
    var returnArea = {
        dest: '',
        base: '',
    }

    areas.forEach( ( area ) => {
        if ( micromatch.isMatch( filePath.replace( './', '' ), area.src ) ) {
            returnArea = area
        }

        if ( 'watch' in area && micromatch.isMatch( filePath.replace( './', '' ), area.watch ) ) {
            returnArea = area
        }
    } )

    return returnArea
}

function formatPaths( property ) {
    // Format paths if required
    if ( 'paths' in global.iLabCompiler.config.app[property] ) {
        global.iLabCompiler.config.app[property].originalPaths = global.iLabCompiler.config.app[property].paths
        global.iLabCompiler.config.app[property].paths = {
            src: getAllSrc( global.iLabCompiler.config.app[property].originalPaths ),
            areas: global.iLabCompiler.config.app[property].originalPaths,
        }
    }
}

function createDirs( property ) {
    if ( !global.iLabCompiler.config.app[property].process ) {
        return false
    }

    let configPaths = global.iLabCompiler.config.app[property].paths
    let paths = []

    if ( Array.isArray( configPaths ) ) {
        paths.push( ...configPaths )
        // eslint-disable-next-line unicorn/new-for-builtins
    } else if ( configPaths == Object( configPaths ) ) {
        if ( Object.prototype.hasOwnProperty.call( configPaths, 'src' ) ) {
            if ( Array.isArray( configPaths.src ) ) {
                paths.push( ...configPaths.src )
            } else if ( typeof configPaths.src === 'string' || configPaths.src instanceof String ) {
                paths.push( configPaths.src )
            }
        }

        if ( Object.prototype.hasOwnProperty.call( configPaths, 'dest' ) ) {
            paths.push( configPaths.dest )
        }

        if ( Object.prototype.hasOwnProperty.call( configPaths, 'areas' ) ) {
            configPaths.areas.forEach( ( area ) => {
                paths.push( area.dest, area.base )
            } )
        }
    }

    paths = paths.map( ( path ) => {
        let parsedPaths = parseGlob( path )
        if ( !parsedPaths.is.globstar && parsedPaths.path.ext == '' ) {
            return path
        }

        if ( parsedPaths.path.ext == '' ) {
            return parsedPaths.base
        }

        return ''
    } )

    paths = paths.filter( Boolean ).filter( ( v, i, s ) => s.indexOf( v ) === i )

    paths.forEach( ( path ) => {
        if ( !fs.existsSync( path ) ) {
            fs.mkdirSync( path, {
                recursive: true,
            } )
            global.iLabCompiler.logger.log( [
                'Directory created:', global.iLabCompiler.logger.ansi.bold + path,
            ], 'green' )
        }
    } )
}

module.exports = {
    getAllSrc,
    relativeSrc,
    getArea,
    formatPaths,
    createDirs,
}
