/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapElement",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapScaleControl"
  ],
  function (GeomapElement) {
    "use strict";

    /**
     * @class
     * Base class for all controls
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapElement
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapControlBase
     */

    const GeomapControlBase = GeomapElement.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapControlBase",
      {
        metadata: {
          tag: "",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapControlBase.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Position of the control on the map. Can be one of the following: "TopLeft", "TopRight", "BottomLeft", "BottomRight".
             */
            position: {
              type: "any",
              mapping: "property",
              defaultValue: "TopLeft"
            },
            /**
             * The text-content of the Web Component.
             */
            text: { type: "string", mapping: "textContent" }
          },

          aggregations: {},

          associations: {},

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return GeomapControlBase;
  }
);
