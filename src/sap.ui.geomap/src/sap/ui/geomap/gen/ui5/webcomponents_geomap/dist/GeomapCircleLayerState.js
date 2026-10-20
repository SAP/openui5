/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapCircleLayerState"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-circle-layer-state` defines the Circle Layer State webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapCircleLayerState.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCircleLayerState
     */

    const GeomapCircleLayerState = WebComponent.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapCircleLayerState",
      {
        metadata: {
          tag: "ui5-geomap-circle-layer-state-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapCircleLayerState.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Describes the name of the cirle layer state.
             */
            name: { type: "string", mapping: "property", defaultValue: "" },
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
             * Describes the outline width of the circle.
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

          methods: []
        }
      }
    );

    return GeomapCircleLayerState;
  }
);
