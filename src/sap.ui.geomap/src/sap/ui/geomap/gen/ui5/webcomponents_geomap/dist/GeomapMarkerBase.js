/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapElement",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapMarkerBase"
  ],
  function (GeomapElement) {
    "use strict";

    /**
     * @class
     * Base class for all marker-based components (spot and container)
     *
     * <h3>Usage</h3>
     *
     * <h3>CSS Shadow Parts</h3>
     *
     * <h3>ES6 Module Import</h3>
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapElement
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapMarkerBase
     */

    const GeomapMarkerBase = GeomapElement.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapMarkerBase",
      {
        metadata: {
          tag: "",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapMarkerBase.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Longitude of the marker.
             */
            lng: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * Latitude of the marker.
             */
            lat: { type: "float", mapping: "property", defaultValue: 0 }
          },

          aggregations: {},

          associations: {},

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return GeomapMarkerBase;
  }
);
