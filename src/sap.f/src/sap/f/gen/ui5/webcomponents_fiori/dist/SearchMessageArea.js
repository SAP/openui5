/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/SearchMessageArea"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * `import "@ui5/webcomponents-fiori/dist/SearchMessageArea.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/SearchMessageArea
     */

    const SearchMessageArea = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.SearchMessageArea",
      {
        metadata: {
          tag: "ui5-search-message-area-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/SearchMessageArea.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Defines the description text to be displayed.
             */
            description: { type: "string", mapping: "property" },
            /**
             * Defines the text to be displayed.
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

          aggregations: {},

          associations: {},

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return SearchMessageArea;
  }
);
