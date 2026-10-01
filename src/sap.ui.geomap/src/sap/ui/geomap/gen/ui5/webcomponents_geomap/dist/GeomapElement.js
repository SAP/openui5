/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapArc"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * Base class for all map elements
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapElement
     */

    const GeomapElement = WebComponent.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapElement",
      {
        metadata: {
          tag: "",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapElement.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * The text-content of the Web Component.
             */
            text: { type: "string", mapping: "textContent" }
          },

          aggregations: {},

          associations: {},

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return GeomapElement;
  }
);
