/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/ListItemBase",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/SearchItemShowMore"
  ],
  function (ListItemBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * A `ui5-search-item-show-more` is a special type of ui5-li that acts as a button to progressively reveal additional (overflow) items within a group.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/SearchItemShowMore.js";`
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/SearchItemShowMore
     */

    const SearchItemShowMore = ListItemBase.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.SearchItemShowMore",
      {
        metadata: {
          tag: "ui5-search-item-show-more-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/SearchItemShowMore.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Specifies the number of additional items available to show.
             * If no value is defined, the control shows "Show more" (without any counter).
             * If a number is provided, it displays "Show more (N)", where N is that number.
             */
            itemsToShowCount: { type: "float", mapping: "property" },
            /**
             * Defines whether the show more item is selected.
             */
            selected: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
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
             * Fired when the component is activated, either with a mouse/tap
             * or by pressing the Enter or Space keys.
             */
            click: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                /**
                 * Indicates whether the event was fired
                 * due to keyboard interaction (Enter or Space) rather than mouse/tap.
                 */
                fromKeyboard: {
                  type: "boolean",
                  types: [
                    {
                      origType: "boolean",
                      multiple: false,
                      dedicatedTypes: [
                        { dtsType: "boolean", ui5Type: "boolean" }
                      ]
                    }
                  ],
                  dtsParamDescription:
                    "Indicates whether the event was fired\ndue to keyboard interaction (Enter or Space) rather than mouse/tap."
                }
              }
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return SearchItemShowMore;
  }
);
