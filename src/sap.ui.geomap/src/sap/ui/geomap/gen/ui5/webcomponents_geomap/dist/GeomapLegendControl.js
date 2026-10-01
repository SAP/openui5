/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapContainerControl",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapLegendControl"
  ],
  function (GeomapContainerControl) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-legend-control` displays a legend on the map with configurable items.
     * It extends `ui5-geomap-container-control` and provides a pre-built UI for map legends.
     *
     * ### Usage
     *
     * ```html
     * <ui5-geomap-legend-control
     *   slot="mapControls"
     *   position="BottomRight"
     *   header-title="Map Legend"
     *   expanded
     * ></ui5-geomap-legend-control>
     * ```
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapLegendControl.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapContainerControl
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapLegendControl
     */

    const GeomapLegendControl = GeomapContainerControl.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapLegendControl",
      {
        metadata: {
          tag: "ui5-geomap-legend-control-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapLegendControl.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Defines the header title of the legend panel.
             */
            headerTitle: {
              type: "string",
              mapping: "property",
              defaultValue: "Legend"
            },
            /**
             * Whether the legend panel is expanded.
             */
            expanded: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Whether the legend is hidden.
             */
            hidden: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Whether the legend can be dragged/moved on the map.
             */
            draggable: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * The legend items to display.
             */
            items: { type: "any[]", mapping: "property", defaultValue: [] },
            /**
             * Position of the control on the map. Can be one of the following: "TopLeft", "TopRight", "BottomLeft", "BottomRight".
             */
            position: {
              type: "any",
              mapping: "property",
              defaultValue: "TopLeft"
            }
          },

          aggregations: {},

          associations: {},

          events: {
            /**
             * Fired when legend is expanded/collapsed.
             */
            toggle: {
              parameters: {}
            },

            /**
             * Fired when a legend item is clicked.
             */
            itemClick: {
              parameters: {}
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return GeomapLegendControl;
  }
);
