/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSource",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapClusterSource"
  ],
  function (GeomapSource) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-cluster-source` defines the Cluster Source webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapClusterSource.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSource
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapClusterSource
     */

    const GeomapClusterSource = GeomapSource.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapClusterSource",
      {
        metadata: {
          tag: "ui5-geomap-cluster-source-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapClusterSource.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Cluster properties
             */
            clusterProperties: {
              type: "object",
              mapping: "property",
              defaultValue: {}
            },
            /**
             * Cluster radius - the bigger, the sooner points will be clustered
             */
            clusterRadius: {
              type: "float",
              mapping: "property",
              defaultValue: 50
            },
            /**
             * Cluster min points - minimum amount of points, required to form a cluster
             */
            clusterMinPoints: {
              type: "float",
              mapping: "property",
              defaultValue: 2
            },
            /**
             * Cluster max zoom - when the zoom level is above this value, clustering is disabled
             */
            clusterMaxZoom: {
              type: "float",
              mapping: "property",
              defaultValue: 0
            },
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

          aggregations: {},

          associations: {},

          events: {},

          getters: [],

          methods: [
            /**
             * Returns all clusters, currently visible on the screen.
             *
             * @public
             * @since 1.155
             * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapClusterSource#getClusters
             * @function
             */

            "getClusters",
            /**
             * Sets feature state
             *
             * @param {any} id
             * @param {any} state
             * @public
             * @since 1.155
             * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapClusterSource#setState
             * @function
             */

            "setState"
          ]
        }
      }
    );

    return GeomapClusterSource;
  }
);
