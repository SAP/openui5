/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsView",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/UserSettingsAccountView"
  ],
  function (UserSettingsView) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-account-view` represents a view displayed in the `ui5-user-settings-item`.
     *
     * @extends module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsView
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsAccountView
     */

    const UserSettingsAccountView = UserSettingsView.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsAccountView",
      {
        metadata: {
          tag: "ui5-user-settings-account-view-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/UserSettingsAccountView.designtime",

          interfaces: [],

          defaultAggregation: "content",

          properties: {
            /**
             * Indicates whether the view is secondary. It is relevant only if the view is used in `pages` slot of `ui5-user-settings-item`
             * and controls the visibility of the back button.
             */
            secondary: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines whether the view is selected. There can be just one selected view at a time.
             */
            selected: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines if the User Settings Account View shows the edit button on the avatar.
             */
            showEditButton: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines if the User Menu shows the `Manage Account` option.
             */
            showManageAccount: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the title text of the user settings view.
             */
            text: { type: "string", mapping: "property" },
            /**
             * The 'width' of the Web Component in <code>sap.ui.core.CSSSize</code>.
             */
            width: { type: "sap.ui.core.CSSSize", mapping: "style" },
            /**
             * The 'height' of the Web Component in <code>sap.ui.core.CSSSize</code>.
             */
            height: { type: "sap.ui.core.CSSSize", mapping: "style" }
          },

          aggregations: {
            /**
             * Defines the user account.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/UserMenuAccount
             */
            account: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuAccount",
              multiple: true,
              slot: "account"
            },
            /**
             * Defines the content of the view.
             * @type module:sap/ui/core/Control
             */
            content: { type: "sap.ui.core.Control", multiple: true }
          },

          associations: {},

          events: {
            /**
             * Fired when the `Edit Accounts` button is selected.
             */
            editAccountsClick: {
              parameters: {}
            },

            /**
             * Fired when the `Manage Account` button is selected.
             */
            manageAccountClick: {
              parameters: {}
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return UserSettingsAccountView;
  }
);
