/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLayer",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapCircleLayer"
  ],
  function (GeomapLayer) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-circle-layer` defines the Circle Layer webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapCircleLayer.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLayer
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCircleLayer
     */

    const GeomapCircleLayer = GeomapLayer.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapCircleLayer",
      {
        metadata: {
          tag: "ui5-geomap-circle-layer-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapCircleLayer.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Describes the radius of the circle.
             */
            radius: { type: "string", mapping: "property", defaultValue: "" },
            /**
             * Describes the fill color of the circle.
             */
            fillColor: {
              type: "string",
              mapping: "property",
              defaultValue: "black"
            },
            /**
             * Describes the outline color of the circle.
             */
            outlineColor: {
              type: "string",
              mapping: "property",
              defaultValue: "black"
            },
            /**
             * Describes the width of the outline of the circle.
             */
            outlineWidth: {
              type: "float",
              mapping: "property",
              defaultValue: 0
            },
            /**
             * Describes the opacity of the circle.
             */
            opacity: { type: "float", mapping: "property", defaultValue: 0.5 },
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
            width: { type: "float", mapping: "property" },
            /**
             * The text-content of the Web Component.
             */
            text: { type: "string", mapping: "textContent" },
            /**
             * The 'height' of the Web Component in <code>sap.ui.core.CSSSize</code>.
             */
            height: { type: "sap.ui.core.CSSSize", mapping: "style" }
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
             * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCircleLayer#getLayer
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
             * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCircleLayer#getFeaturesAtPoint
             * @function
             */

            "getFeaturesAtPoint"
          ]
        }
      }
    );

    return GeomapCircleLayer;
  }
);
