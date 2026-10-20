/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapPoint"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-point` defines the Point webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapPoint.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapPoint
     */

    const GeomapPoint = WebComponent.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapPoint",
      {
        metadata: {
          tag: "ui5-geomap-point-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapPoint.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Longitute of the point.
             */
            lng: { type: "float", mapping: "property", defaultValue: 0 },
            /**
             * Latitude of the point.
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

          aggregations: {},

          associations: {},

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return GeomapPoint;
  }
);
