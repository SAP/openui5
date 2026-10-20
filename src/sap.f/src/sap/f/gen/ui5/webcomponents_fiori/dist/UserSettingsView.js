/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/UserSettingsAppearanceView"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-view` represents a view displayed in the `ui5-user-settings-item`.
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsView
     */

    const UserSettingsView = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsView",
      {
        metadata: {
          tag: "ui5-user-settings-view-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/UserSettingsView.designtime",

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
             * Defines the content of the view.
             * @type module:sap/ui/core/Control
             */
            content: { type: "sap.ui.core.Control", multiple: true }
          },

          associations: {},

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return UserSettingsView;
  }
);
