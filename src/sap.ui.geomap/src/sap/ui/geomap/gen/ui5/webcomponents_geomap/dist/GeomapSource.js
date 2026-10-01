/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapElement",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapClusterSource"
  ],
  function (GeomapElement) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-source` defines the Source webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapSource.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapElement
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSource
     */

    const GeomapSource = GeomapElement.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapSource",
      {
        metadata: {
          tag: "ui5-geomap-source-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapSource.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * GeoJSON as a source data.
             */
            geojson: { type: "object", mapping: "property", defaultValue: {} },
            /**
             * geojsonUrl - URL to GeoJSON file used as data
             */
            geojsonUrl: {
              type: "string",
              mapping: "property",
              defaultValue: ""
            },
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

          methods: [
            /**
             * Sets feature state
             *
             * @param {any} id
             * @param {any} state
             * @public
             * @since 1.155
             * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSource#setState
             * @function
             */

            "setState"
          ]
        }
      }
    );

    return GeomapSource;
  }
);
