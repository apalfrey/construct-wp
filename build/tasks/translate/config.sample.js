module.exports = {
    // Place in your .gulpconfig.js
    translate: {
        process: true,
        watch: true,
        paths: {
            src: './**/*.php',
            watch: './**/*.php',
            dest: './languages/PACKAGE.pot',
        },
        srcOptions: {
            allowEmpty: true,
        },
        pipes: {
            checktextdomain: {
                text_domain: 'PACKAGE',
                keywords: [
                    '__:1,2d',
                    '_e:1,2d',
                    '_x:1,2c,3d',
                    '_ex:1,2c,3d',
                    '_n:1,2,4d',
                    '_nx:1,2,4c,5d',
                    '_n_noop:1,2,3d',
                    '_nx_noop:1,2,3c,4d',
                    'esc_html__:1,2d',
                    'esc_html_e:1,2d',
                    'esc_html_x:1,2c,3d',
                    'esc_attr__:1,2d',
                    'esc_attr_e:1,2d',
                    'esc_attr_x:1,2c,3d',
                ],
                report_missing: true,
                report_success: false,
                report_variable_domain: true,
                correct_domain: true,
                create_report_file: false,
                force: false,
            },
            pot: {
                domain: 'PACKAGE',
                package: 'Project Name',
                lastTranslator: 'PACKAGE AUTHOR <PACKAGE@EMAIL.COM>',
                headers: {
                    'Language-Team': 'PACKAGE AUTHOR <PACKAGE@EMAIL.COM>',
                },
            },
        },
    },
}