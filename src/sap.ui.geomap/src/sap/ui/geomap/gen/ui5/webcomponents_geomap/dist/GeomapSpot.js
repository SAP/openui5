/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapMarkerBase",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapSpot"
  ],
  function (GeomapMarkerBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-spot` defines the Spot webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapSpot.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapMarkerBase
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSpot
     */

    const GeomapSpot = GeomapMarkerBase.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapSpot",
      {
        metadata: {
          tag: "ui5-geomap-spot-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapSpot.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Describes if the spot is draggable.
             */
            draggable: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Icon of the spot displayed on the map.
             */
            icon: { type: "string", mapping: "property", defaultValue: "map" },
            /**
             * Width of the spot displayed on the map.
             */
            width: {
              type: "string",
              mapping: "property",
              defaultValue: "2rem"
            },
            /**
             * Height of the spot displayed on the map.
             */
            height: {
              type: "string",
              mapping: "property",
              defaultValue: "2rem"
            },
            /**
             * Opacity of the spot displayed on the map.
             */
            opacity: { type: "string", mapping: "property", defaultValue: "1" },
            /**
             * Color of the spot displayed on the map.
             */
            color: { type: "string", mapping: "property", defaultValue: "" },
            /**
             * Anchor point of the marker element relative to the geographic coordinate.
             * Determines which part of the marker element is placed at the exact lng/lat position.
             * Use "bottom" (default) so the tip of a pin icon points to the coordinate.
             * Accepted values: "center", "top", "bottom", "left", "right",
             * "top-left", "top-right", "bottom-left", "bottom-right".
             */
            anchor: {
              type: "any",
              mapping: "property",
              defaultValue: "bottom"
            },
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

          events: {
            /**
             * Fired once the spot is clicked.
             */
            click: {
              allowPreventDefault: true,
              parameters: {}
            },

            /**
             * Fired on double-click of the spot.
             */
            doubleClick: {
              parameters: {}
            },

            /**
             * Fired on right-click of the spot.
             */
            rightClick: {
              allowPreventDefault: true,
              parameters: {}
            },

            /**
             * Fired on mouseover of the spot.
             */
            mouseover: {
              parameters: {}
            },

            /**
             * Fired on mouseout of the spot.
             */
            mouseout: {
              parameters: {}
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return GeomapSpot;
  }
);
