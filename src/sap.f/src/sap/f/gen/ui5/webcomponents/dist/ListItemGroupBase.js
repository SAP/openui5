/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents",
    "sap/f/thirdparty/UserSettingsAppearanceViewGroup"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * `ListItemGroupBase` is the abstract base for grouping components. It provides the minimal
     * "group" contract shared by `ui5-li-group` and `ui5-option-group`: a header text, the default
     * items slot, and the plumbing the internal `ui5-list` relies on to flatten grouped items.
     *
     * Concrete group components extend this class and add only the public API that is relevant to them.
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents/dist/ListItemGroupBase
     */

    const ListItemGroupBase = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents.dist.ListItemGroupBase",
      {
        metadata: {
          tag: "",

          namespace: "sap.f.gen.ui5.webcomponents",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents/designtime/ListItemGroupBase.designtime",

          interfaces: [],

          defaultAggregation: "items",

          properties: {
            /**
             * Defines the header text of the group.
             */
            headerText: { type: "string", mapping: "property" },
            /**
             * The text-content of the Web Component.
             */
            text: { type: "string", mapping: "textContent" }
          },

          aggregations: {
            /**
             * Defines the items of the group.
             * @type module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
             */
            items: {
              type: "sap.f.gen.ui5.webcomponents.dist.ListItemBase",
              multiple: true
            }
          },

          associations: {},

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return ListItemGroupBase;
  }
);
