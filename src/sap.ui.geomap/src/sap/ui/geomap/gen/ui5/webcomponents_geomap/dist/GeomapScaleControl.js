/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapControlBase",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapScaleControl"
  ],
  function (GeomapControlBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-scale-control` defines the Scale webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapScaleControl.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapControlBase
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapScaleControl
     */

    const GeomapScaleControl = GeomapControlBase.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapScaleControl",
      {
        metadata: {
          tag: "ui5-geomap-scale-control-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapScaleControl.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Units of the distance for the scale control. Possible values are "Imperial", "Metric" or "Nautical".
             * @type module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/types/GeomapScaleControlUnits
             */
            units: {
              type: "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.types.GeomapScaleControlUnits",
              mapping: "property",
              defaultValue: "Metric"
            },
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

          aggregations: {},

          associations: {},

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return GeomapScaleControl;
  }
);
