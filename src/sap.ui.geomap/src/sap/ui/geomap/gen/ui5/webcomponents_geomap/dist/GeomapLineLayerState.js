/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapLineLayerState"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-line-layer-state` defines the Line Layer State webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapLineLayerState.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLineLayerState
     */

    const GeomapLineLayerState = WebComponent.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapLineLayerState",
      {
        metadata: {
          tag: "ui5-geomap-line-layer-state-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapLineLayerState.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Describes the name of the layer.
             */
            name: { type: "string", mapping: "property", defaultValue: "" },
            /**
             * Describes the color of the layer.
             */
            color: {
              type: "string",
              mapping: "property",
              defaultValue: "black"
            },
            /**
             * Describes the width of the layer.
             */
            width: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * Describes the opacity of the layer.
             */
            opacity: { type: "float", mapping: "property", defaultValue: 0.5 },
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

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return GeomapLineLayerState;
  }
);
