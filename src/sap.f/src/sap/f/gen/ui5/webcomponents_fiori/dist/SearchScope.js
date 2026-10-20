/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/SearchScope"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * The `ui5-search-scope` represents the options for the scope in `ui5-search`.
     *
     * @implements module:sap/f/gen/ui5/webcomponents_fiori/dist/SearchField.ISearchScope
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/SearchScope
     */

    const SearchScope = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.SearchScope",
      {
        metadata: {
          tag: "ui5-search-scope-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/SearchScope.designtime",

          interfaces: ["sap.f.gen.ui5.webcomponents_fiori.dist.SearchField.ISearchScope"],

          defaultAggregation: "",

          properties: {
            /**
             * Defines the text of the component.
             */
            text: { type: "string", mapping: "property", defaultValue: "" },
            /**
             * Defines the value of the `ui5-search-scope`.
             * Used for selection in Search scopes.
             */
            value: { type: "string", mapping: "property" },
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

    return SearchScope;
  }
);
