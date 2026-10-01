/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapMarkerBase",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapContainer"
  ],
  function (GeomapMarkerBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-container` defines the Container webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapContainer.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapMarkerBase
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapContainer
     */

    const GeomapContainer = GeomapMarkerBase.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapContainer",
      {
        metadata: {
          tag: "ui5-geomap-container-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapContainer.designtime",

          interfaces: [],

          defaultAggregation: "content",

          properties: {
            /**
             * Anchor point of the container element relative to the geographic coordinate.
             * Determines which part of the container element is placed at the exact lng/lat position.
             * Use "bottom-left" (default) so the container content sits above and to the right of the pin point.
             * Accepted values: "center", "top", "bottom", "left", "right",
             * "top-left", "top-right", "bottom-left", "bottom-right".
             */
            anchor: {
              type: "any",
              mapping: "property",
              defaultValue: "bottom-left"
            },
            /**
             * Longitude of the marker.
             */
            lng: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * Latitude of the marker.
             */
            lat: { type: "float", mapping: "property", defaultValue: 0 },
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

          aggregations: {
            /**
             * Content
             * @type module:sap/ui/core/Control
             */
            content: { type: "sap.ui.core.Control", multiple: true }
          },

          associations: {},

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return GeomapContainer;
  }
);
