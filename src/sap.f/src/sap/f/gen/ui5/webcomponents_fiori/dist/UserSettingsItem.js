/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ui/core/EnabledPropagator",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/UserSettingsItem"
  ],
  function (WebComponent, EnabledPropagator) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-item` represents an item in the `ui5-user-settings-dialog`.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserSettingsItem.js";`
     *
     * You can disable the <code>UserSettingsItem</code> by setting the <code>enabled</code> property to <code>false</code>,
     * or use the <code>UserSettingsItem</code> in read-only mode by setting the <code>editable</code> property to false.
     *
     * <b>Note:</b> Disabled and read-only states shouldn't be used together.
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsItem
     */

    const UserSettingsItem = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsItem",
      {
        metadata: {
          tag: "ui5-user-settings-item-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/UserSettingsItem.designtime",

          interfaces: [],

          defaultAggregation: "pages",

          properties: {
            /**
             * Defines the accessible ARIA name of the component.
             */
            accessibleName: { type: "string", mapping: "property" },
            /**
             * Defines whether the component is in disabled state.
             *
             * **Note:** A disabled component is completely noninteractive.
             */
            enabled: {
              type: "boolean",
              defaultValue: true,
              mapping: {
                type: "property",
                to: "disabled",
                formatter: "_mapEnabled"
              }
            },
            /**
             * Defines the headerText of the item.
             */
            headerText: {
              type: "string",
              mapping: "property",
              defaultValue: ""
            },
            /**
             * Defines the icon of the component.
             */
            icon: {
              type: "string",
              mapping: "property",
              defaultValue: "globe"
            },
            /**
             * Indicates whether a loading indicator should be shown.
             */
            loading: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Indicates why the control is in loading state.
             */
            loadingReason: { type: "string", mapping: "property" },
            /**
             * Shows item tab.
             */
            selected: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the text of the user settings item.
             */
            text: { type: "string", mapping: "property", defaultValue: "" },
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
             * Defines the page views of the user settings item.
             *
             * If there are no tab views, the first page view will be shown unless there is selected one. If there is selected page
             * view it will be shown no matter if there are tab views.
             *
             * The page views are displayed by default if there is no selected tab view.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsView
             */
            pages: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsView",
              multiple: true
            },
            /**
             * Defines the tab views of the user settings item.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsView
             */
            tabs: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsView",
              multiple: true,
              slot: "tabs"
            }
          },

          associations: {},

          events: {
            /**
             * Fired when a selected view changed.
             */
            selectionChange: {
              allowPreventDefault: true,
              parameters: {
                /**
                 * The selected `view`.
                 */
                view: {
                  type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsView",
                  types: [
                    {
                      origType: "UserSettingsView",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "UserSettingsView",
                          ui5Type:
                            "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsView",
                          moduleType:
                            "module:ui5/webcomponents_fiori/dist/UserSettingsView",
                          packageName:
                            "sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsView",
                          isClass: true
                        }
                      ]
                    }
                  ],
                  dtsParamDescription: "The selected `view`."
                }
              }
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    EnabledPropagator.call(UserSettingsItem.prototype);

    return UserSettingsItem;
  }
);
