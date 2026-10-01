/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLayer",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapSymbolLayer"
  ],
  function (GeomapLayer) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-symbol-layer` defines the Symbol Layer webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapSymbolLayer.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLayer
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSymbolLayer
     */

    const GeomapSymbolLayer = GeomapLayer.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapSymbolLayer",
      {
        metadata: {
          tag: "ui5-geomap-symbol-layer-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapSymbolLayer.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Text to be displayed in the layer.
             */
            text: { type: "string", mapping: "property", defaultValue: "" },
            /**
             * Size of the font that is displayed in the layer. Units in pixels. Requires text-field.
             */
            textSize: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * Color of the text that is displayed in the layer.
             */
            textColor: {
              type: "string",
              mapping: "property",
              defaultValue: "black"
            },
            /**
             * Which part of the text is closest to the point: "center", "left", "right", "top", "bottom", "top-left", "top-right", "bottom-left", "bottom-right"
             */
            textAnchor: {
              type: "string",
              mapping: "property",
              defaultValue: "center"
            },
            /**
             * Font stack to use for displaying text. Defaults to Open Sans Regular,Arial Unicode MS Regular. Requires text-field.
             */
            textFont: {
              type: "any",
              mapping: "property",
              defaultValue: ["Arial Unicode MS Regular"]
            },
            /**
             * ID of a ui5-geomap-source element
             */
            source: { type: "string", mapping: "property", defaultValue: "" },
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
            width: { type: "float", mapping: "property" }
          },

          aggregations: {},

          associations: {},

          events: {
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
             * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSymbolLayer#getLayer
             * @function
             */

            "layer"
          ],

          methods: [
            /**
             * Returns this layer's features, found at a point
             *
             * @param {any} point
             * @public
             * @since 1.155
             * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSymbolLayer#getFeaturesAtPoint
             * @function
             */

            "getFeaturesAtPoint"
          ]
        }
      }
    );

    return GeomapSymbolLayer;
  }
);
