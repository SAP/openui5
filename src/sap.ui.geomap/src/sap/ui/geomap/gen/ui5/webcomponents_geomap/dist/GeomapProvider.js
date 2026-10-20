/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapProviderBase",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapProvider"
  ],
  function (GeomapProviderBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-provider` defines the Provider webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapProvider.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapProviderBase
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapProvider
     */

    const GeomapProvider = GeomapProviderBase.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapProvider",
      {
        metadata: {
          tag: "ui5-geomap-provider-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapProvider.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Style URL - containing url to the provider resources for style. Should contain API key if such is required.
             */
            styleUrl: { type: "string", mapping: "property", defaultValue: "" },
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

    return GeomapProvider;
  }
);
