/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapControlBase",
    "sap/ui/geomap/gen/ui5/webcomponents_geomap",
    "sap/ui/geomap/thirdparty/GeomapSelectionControl"
  ],
  function (GeomapControlBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-geomap-selection-control` defines the Selection webcomponent.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-geomap/dist/GeomapSelectionControl.js";`
     *
     * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapControlBase
     * @constructor
     * @public
     * @since 1.155
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSelectionControl
     */

    const GeomapSelectionControl = GeomapControlBase.extend(
      "sap.ui.geomap.gen.ui5.webcomponents_geomap.dist.GeomapSelectionControl",
      {
        metadata: {
          tag: "ui5-geomap-selection-control-00e926c3",

          namespace: "sap.ui.geomap.gen.ui5.webcomponents_geomap",

          library: "sap.ui.geomap",

          designtime:
            "sap/ui/geomap/gen/ui5/webcomponents_geomap/designtime/GeomapSelectionControl.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Type of the selection used. Can be rectangle, freehand, polygon, circle or select.
             */
            selectionType: {
              type: "string",
              mapping: "property",
              defaultValue: "rectangle"
            },
            /**
             * The selection mode buttons that should be available to the end user.
             * When empty, all selection modes are rendered.
             *
             * Supported values: `freehand`, `polygon`, `rectangle`, `circle`, `select`.
             *
             * The buttons render in the order given in the array. If the active
             * `selectionType` is no longer rendered (because it was removed from
             * `modes`), it is reassigned to the first button currently visible in
             * the toolbar — this means the active type can stay unchanged even
             * when `modes` is an empty array or contains only unknown values, since
             * the visible toolbar then falls back to the full default list.
             * Unknown values are dropped with a `console.warn`; if every supplied
             * value is unknown, the full default list is used as a fallback.
             *
             * The delete button is always rendered alongside the configured mode
             * buttons and is not affected by this property.
             *
             * Can be changed at runtime.
             */
            modes: { type: "any[]", mapping: "property", defaultValue: [] },
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

          events: {
            /**
             * Fired when selection is finished.
             */
            selectionFinish: {
              enableEventBubbling: true,
              parameters: {
                /**
                 * The id of the selected feature
                 */
                id: {
                  type: "any",
                  types: [
                    {
                      origType: "FeatureId",
                      multiple: false,
                      dedicatedTypes: [
                        { isUnclear: true, dtsType: "any", ui5Type: "any" }
                      ]
                    }
                  ],
                  dtsParamDescription: "The id of the selected feature"
                },
                /**
                 * The context of the selected feature
                 */
                context: {
                  type: "any",
                  types: [
                    {
                      origType: "OnFinishContext",
                      multiple: false,
                      dedicatedTypes: [
                        { isUnclear: true, dtsType: "any", ui5Type: "any" }
                      ]
                    }
                  ],
                  dtsParamDescription: "The context of the selected feature"
                },
                /**
                 * The snapshot of the selected feature
                 */
                snapshot: {
                  type: "any",
                  types: [
                    {
                      origType: "GeoJSONStoreFeatures",
                      multiple: true,
                      dedicatedTypes: [
                        { isUnclear: true, dtsType: "any", ui5Type: "any" }
                      ]
                    }
                  ],
                  dtsParamDescription: "The snapshot of the selected feature"
                }
              }
            },

            /**
             * Fired when item is selected.
             */
            selectionItem: {
              enableEventBubbling: true,
              parameters: {
                /**
                 * The id of the selected feature
                 */
                id: {
                  type: "any",
                  types: [
                    {
                      origType: "FeatureId",
                      multiple: false,
                      dedicatedTypes: [
                        { isUnclear: true, dtsType: "any", ui5Type: "any" }
                      ]
                    }
                  ],
                  dtsParamDescription: "The id of the selected feature"
                },
                /**
                 * The snapshot of the selected feature
                 */
                snapshot: {
                  type: "any",
                  types: [
                    {
                      origType: "GeoJSONStoreFeatures",
                      multiple: true,
                      dedicatedTypes: [
                        { isUnclear: true, dtsType: "any", ui5Type: "any" }
                      ]
                    }
                  ],
                  dtsParamDescription: "The snapshot of the selected feature"
                },
                /**
                 * The selected object
                 */
                selObj: {
                  type: "any",
                  types: [
                    {
                      origType: "GeoJSONStoreFeatures",
                      multiple: false,
                      dedicatedTypes: [
                        { isUnclear: true, dtsType: "any", ui5Type: "any" }
                      ]
                    }
                  ],
                  dtsParamDescription: "The selected object"
                }
              }
            }
          },

          getters: [],

          methods: [
            /**
             * Changes styling of the selection control with given set of styles
             *
             * @param {any} oStyles
             * @public
             * @since 1.155
             * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSelectionControl#setModeStyles
             * @function
             */

            "setModeStyles",
            /**
             * API for setting custom validator used during selection.
             *
             * @param {any} fn
             * @public
             * @since 1.155
             * @name module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/GeomapSelectionControl#setValidator
             * @function
             */

            "setValidator"
          ]
        }
      }
    );

    return GeomapSelectionControl;
  }
);
