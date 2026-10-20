/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapControlBase",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapContainerControl"
  ],
  function (GeomapControlBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-container-control` defines a reusable container webcomponent that can hold custom HTML content
     * and be positioned on the sides of the map.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapContainerControl.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapControlBase
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapContainerControl
     */

    const GeomapContainerControl = GeomapControlBase.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapContainerControl",
      {
        metadata: {
          tag: "ui5-geomap-container-control-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapContainerControl.designtime",

          interfaces: [],

          defaultAggregation: "content",

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
             * Describes the content of the container control.
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

    return GeomapContainerControl;
  }
);
