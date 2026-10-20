/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsView",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/UserSettingsAppearanceView"
  ],
  function (UserSettingsView) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-appearance-view` represents a view displayed in the `ui5-user-settings-item`.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserSettingsAppearanceView.js";`
     *
     * @extends module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsView
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsAppearanceView
     */

    const UserSettingsAppearanceView = UserSettingsView.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsAppearanceView",
      {
        metadata: {
          tag: "ui5-user-settings-appearance-view-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/UserSettingsAppearanceView.designtime",

          interfaces: [],

          defaultAggregation: "items",

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
             * Defines additional content displayed below the items list.
             * @type module:sap/ui/core/Control
             */
            additionalContent: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "additionalContent"
            },
            /**
             * Defines the items of the component.
             * @type module:sap/ui/core/webc/WebComponent
             */
            items: { type: "sap.ui.core.webc.WebComponent", multiple: true }
          },

          associations: {},

          events: {
            /**
             * Fired when an item is selected.
             */
            selectionChange: {
              allowPreventDefault: true,
              parameters: {
                /**
                 * The selected `user settings appearance view item`.
                 */
                item: {
                  type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsAppearanceViewItem",
                  types: [
                    {
                      origType: "UserSettingsAppearanceViewItem",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "UserSettingsAppearanceViewItem",
                          ui5Type:
                            "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsAppearanceViewItem",
                          moduleType:
                            "module:ui5/webcomponents_fiori/dist/UserSettingsAppearanceViewItem",
                          packageName:
                            "sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsAppearanceViewItem",
                          isClass: true
                        }
                      ]
                    }
                  ],
                  dtsParamDescription:
                    "The selected `user settings appearance view item`."
                }
              }
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return UserSettingsAppearanceView;
  }
);
