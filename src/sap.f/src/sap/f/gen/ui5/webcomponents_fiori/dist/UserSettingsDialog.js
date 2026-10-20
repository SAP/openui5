/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/UserSettingsDialog"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-dialog` is an SAP Fiori-specific web component used in the `ui5-user-menu`.
     * It allows the user to easily view information and settings for an account.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserSettingsDialog.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsDialog
     */

    const UserSettingsDialog = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsDialog",
      {
        metadata: {
          tag: "ui5-user-settings-dialog-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/UserSettingsDialog.designtime",

          interfaces: [],

          defaultAggregation: "items",

          properties: {
            /**
             * Defines the headerText of the item.
             */
            headerText: { type: "string", mapping: "property" },
            /**
             * Defines, if the User Settings Dialog is opened.
             */
            open: { type: "boolean", mapping: "property", defaultValue: false },
            /**
             * Defines whether the dialog offers Save and Cancel actions in its footer.
             *
             * When true, the footer renders a Save (Emphasized) and a Cancel button
             * instead of the default Close button. Save and Cancel each fire a
             * corresponding event; the application is responsible for closing the
             * dialog (typically after persisting or discarding the changes).
             */
            saveMode: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines if the Search Field would be displayed.
             *
             * **Note:** By default the Search Field is not displayed.
             */
            showSearchField: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * The text-content of the Web Component.
             */
            text: { type: "string", mapping: "textContent" },
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
             * Defines the user settings items.
             *
             * **Note:**  If no setting item is set as `selected`, the first one will be selected.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsItem
             */
            items: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsItem",
              multiple: true
            },
            /**
             * Defines the fixed user settings items.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsItem
             */
            fixedItems: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsItem",
              multiple: true,
              slot: "fixedItems"
            }
          },

          associations: {},

          events: {
            /**
             * Fired before the settings dialog is closed.
             *
             * **Note:** This event is cancelable via `preventDefault()`, allowing the application to keep the
             * dialog open — for example, to prompt the user about unsaved changes before dismissal.
             */
            beforeClose: {
              allowPreventDefault: true,
              parameters: {}
            },

            /**
             * Fired when the Cancel button in the footer is clicked.
             * The dialog does not close automatically — the application is responsible
             * for closing it after discarding the changes.
             */
            cancel: {
              parameters: {}
            },

            /**
             * Fired when the settings dialog is closed.
             */
            close: {
              parameters: {}
            },

            /**
             * Fired when the settings dialog is opened.
             */
            onOpen: {
              mapping: "open",
              parameters: {}
            },

            /**
             * Fired when the Save button in the footer is clicked.
             * The dialog does not close automatically — the application is responsible
             * for closing it after persisting the changes.
             */
            save: {
              parameters: {}
            },

            /**
             * Fired when an item is selected.
             */
            selectionChange: {
              allowPreventDefault: true,
              parameters: {
                /**
                 * The selected `user settings item`.
                 */
                item: {
                  type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsItem",
                  types: [
                    {
                      origType: "UserSettingsItem",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "UserSettingsItem",
                          ui5Type:
                            "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsItem",
                          moduleType:
                            "module:ui5/webcomponents_fiori/dist/UserSettingsItem",
                          packageName:
                            "sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsItem",
                          isClass: true
                        }
                      ]
                    }
                  ],
                  dtsParamDescription: "The selected `user settings item`."
                }
              }
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return UserSettingsDialog;
  }
);
