/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapShape",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapGeocircle"
  ],
  function (GeomapShape) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-geocircle` defines the Geo Circle webcomponent.
     * GeomapGeocircle represents circles, defined in a real-world units (km, miles, etc.).
     * Rendered on the map as layers.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapGeocircle.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapShape
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapGeocircle
     */

    const GeomapGeocircle = GeomapShape.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapGeocircle",
      {
        metadata: {
          tag: "ui5-geomap-geocircle-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapGeocircle.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Describes the longitude of the center of the geo-circle.
             */
            lng: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * Describes the latitude of the center of the geo-circle.
             */
            lat: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * Describes the radius of the geo-circle.
             */
            radius: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * Describes the units in which the radius is measured.
             */
            units: {
              type: "string",
              mapping: "property",
              defaultValue: "kilometers"
            },
            /**
             * Describes the color of the fill of the geo-circle.
             */
            fillColor: {
              type: "string",
              mapping: "property",
              defaultValue: "black"
            },
            /**
             * Describes the outline color of the geo-circle.
             */
            outlineColor: {
              type: "string",
              mapping: "property",
              defaultValue: "black"
            },
            /**
             * Describes the opacity of the fill of the geo-circle.
             */
            opacity: { type: "float", mapping: "property", defaultValue: 0.5 },
            /**
             * Describes if the geocircle is draggable & editable.
             */
            dragndrop: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * When the map's zoom property is less than this value, the layer will be hidden.
             * Accepts values between 0 and 24.
             */
            minZoom: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * When the map's zoom property is equal to, or greater than this value, the layer will be hidden
             * Accepts values between 0 and 24.
             */
            maxZoom: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * When set, only features, matching the filter, will be displayed
             */
            filter: { type: "object", mapping: "property", defaultValue: {} },
            /**
             * Determines which features the layer will display - All (default), only not-clustered, or only clustered
             * <b>Note:</b> This property is ignored if the <code>filter</code> property is set
             * <b>Note:</b> This property only makes sense when the layer is used for clustering (displays data from a <code>ui5-geomap-cluster-source</code> element)
             * @type module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/types/GeomapDisplayedFeatures
             */
            displayedFeatures: {
              type: "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.types.GeomapDisplayedFeatures",
              mapping: "property",
              defaultValue: "All"
            },
            /**
             * Determines if the layer is hidden.
             */
            hidden: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Describes the zIndex of the layer. The layer with the highest zIndex will be on top.
             */
            zIndex: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * Describes the width of the layer.
             */
            width: { type: "float", mapping: "property" },
            /**
             * The 'height' of the Web Component in <code>sap.ui.core.CSSSize</code>.
             */
            height: { type: "sap.ui.core.CSSSize", mapping: "style" }
          },

          aggregations: {},

          associations: {},

          events: {
            /**
             * Fired when the geocircle edit is finished.
             */
            geocircleDragndropEnd: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {}
            },

            /**
             * Layer clicked
             */
            layerClick: {
              parameters: {}
            },

            /**
             * Mouse entered layer
             */
            layerMouseenter: {
              parameters: {}
            },

            /**
             * Mouse moved in the layer
             */
            layerMousemove: {
              parameters: {}
            },

            /**
             * Mouse left the layer
             */
            layerMouseleave: {
              parameters: {}
            },

            /**
             * Mouse button down on the layer
             */
            layerMousedown: {
              parameters: {}
            },

            /**
             * Mouse button up on the layer
             */
            layerMouseup: {
              parameters: {}
            }
          },

          getters: [
            /**
             * Returns the layer object in maplibre
             *
             * @public
             * @since 1.155
             * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapGeocircle#getLayer
             * @function
             */

            "layer"
          ],

          methods: []
        }
      }
    );

    return GeomapGeocircle;
  }
);
