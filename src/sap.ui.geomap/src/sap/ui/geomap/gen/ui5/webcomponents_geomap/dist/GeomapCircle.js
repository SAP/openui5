/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapShape",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapCircle"
  ],
  function (GeomapShape) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-circle` defines the Circle webcomponent.
     * GeomapCircle represent circles, defined in screen units (pixels).
     * Rendered on the map as layers.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapCircle.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapShape
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCircle
     */

    const GeomapCircle = GeomapShape.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapCircle",
      {
        metadata: {
          tag: "ui5-geomap-circle-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapCircle.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Describes the longitude of the center of the circle.
             */
            lng: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * Describes the latitude of the center of the circle.
             */
            lat: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * Describes the radius of the circle.
             */
            radius: { type: "float", mapping: "property", defaultValue: 0 },
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
             * Describes if the circle is draggable & editable.
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
             * Fired when the circle edit is finished.
             */
            circleDragndropEnd: {
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
             * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCircle#getLayer
             * @function
             */

            "layer"
          ],

          methods: []
        }
      }
    );

    return GeomapCircle;
  }
);
