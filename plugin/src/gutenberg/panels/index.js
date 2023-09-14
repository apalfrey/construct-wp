import { registerPlugin } from '@wordpress/plugins'

import EmailPanel from './email'

const panels = [
    EmailPanel,
]

panels.forEach( ( panel ) => {
    registerPlugin( `cwp-${panel.name}-panel`, panel.options )
} )

export default panels
