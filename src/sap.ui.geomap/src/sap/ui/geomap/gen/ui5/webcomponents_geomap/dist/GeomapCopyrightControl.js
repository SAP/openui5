/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapControlBase",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapCopyrightControl"
  ],
  function (GeomapControlBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-copyright-control` defines the copyright webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapCopyrightControl.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapControlBase
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapCopyrightControl
     */

    const GeomapCopyrightControl = GeomapControlBase.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapCopyrightControl",
      {
        metadata: {
          tag: "ui5-geomap-copyright-control-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapCopyrightControl.designtime",

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
             * Describes the content of the copyright control.
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

    return GeomapCopyrightControl;
  }
);
