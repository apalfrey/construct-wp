(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    (function () {
      // Augment each menu item control once it is added and embedded.
      wp.customize.control.bind('add', control => {
        if (control.extended(wp.customize.Menus.MenuItemControl)) {
          control.deferred.embedded.done(() => {
            extendControl(control);
          });
        }
      });

      /**
       * Extend the control with roles information.
       *
       * @param {wp.customize.Menus.MenuItemControl} control
       */
      function extendControl(control) {
        control.iconField = control.container.find('[name="edit-menu-item-icon"]');
        control.visibilityField = control.container.find('[name="edit-menu-item-visibility"]');
        control.logoutLinkField = control.container.find('[name="edit-menu-item-logout_link"]');
        control.linkTypeField = control.container.find('[name="edit-menu-item-link_type"]');

        // Set the initial UI state.
        updateControlFields(control);

        // Update the UI state when the setting changes programmatically.
        control.setting.bind(() => {
          updateControlFields(control);
        });

        // Update the setting when the inputs are modified.
        control.iconField.on('input', e => {
          setSetting(control.setting, {
            icon: e.target.value
          });
        });
        control.visibilityField.on('change', e => {
          setSetting(control.setting, {
            visibility: e.target.value
          });
        });
        control.logoutLinkField.on('change', e => {
          setSetting(control.setting, {
            // eslint-disable-next-line camelcase
            logout_link: e.target.checked ? '1' : '0'
          });
        });
        control.linkTypeField.on('change', e => {
          setSetting(control.setting, {
            // eslint-disable-next-line camelcase
            link_type: e.target.value
          });
        });
      }

      /**
       * Extend the setting with updated information.
       *
       * @param {wp.customize.Setting} setting
       * @param {string|Array} roles
       */
      function setSetting(setting, value) {
        setting.set({
          ..._.clone(setting()),
          ...value
        });
      }

      /**
       * Apply the control's setting value to the control's fields.
       *
       * @param {wp.customize.Menus.MenuItemControl} control
       */
      function updateControlFields(control) {
        control.iconField.val(control.setting().icon);
        control.visibilityField.val(control.setting().visibility);
        control.logoutLinkField.prop('checked', control.setting().logout_link === '1');
        control.linkTypeField.val(control.setting().link_type);
      }
    })();

}));
//# sourceMappingURL=construct-wp-customizer.js.map
