import {
    PluginDocumentSettingPanel,
} from '@wordpress/edit-post'
import {
    select,
    useSelect,
    useDispatch,
} from '@wordpress/data'
import {
    TextControl,
} from '@wordpress/components'
import {
    __,
} from '@wordpress/i18n'

function EmailPanel() {
    const postType = select( 'core/editor' ).getCurrentPostType()

    if ( postType !== 'cwp_email' ) {
        return null
    }

    const { slug } = useSelect( ( select ) => {
        return {
            slug: select( 'core/editor' ).getEditedPostSlug(),
        }
    } )

    const { editPost } = useDispatch( 'core/editor', [slug] )

    return (
        <PluginDocumentSettingPanel
            name="ilab-restrict-access-sidebar"
            title={__( 'Permalink', 'construct-wp' )}
        >
            <TextControl
                label={__( 'Set the email permalink', 'construct-wp' )}
                help={__( 'This is used as a reference for this email template. This can be automatically generated on creation.', 'construct-wp' )}
                type="text"
                value={ slug }
                onChange={ ( value ) => editPost( { slug: value } ) }
                required
            />
        </PluginDocumentSettingPanel>
    )
}

export default {
    name: 'email',
    options: {
        icon: '',
        render: EmailPanel,
    },
}
