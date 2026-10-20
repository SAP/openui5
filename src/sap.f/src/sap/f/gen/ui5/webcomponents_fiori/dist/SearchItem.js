/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/ListItemBase",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/SearchItem"
  ],
  function (ListItemBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * A `ui5-search-item` is a list item, used for displaying search suggestions
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/SearchItem.js";`
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/SearchItem
     */

    const SearchItem = ListItemBase.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.SearchItem",
      {
        metadata: {
          tag: "ui5-search-item-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/SearchItem.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Defines whether the search item is deletable.
             */
            deletable: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the description that appears right under the item text, if available.
             */
            description: { type: "string", mapping: "property" },
            /**
             * Defines the icon name of the search item.
             * **Note:** If provided, the image slot will be ignored.
             */
            icon: { type: "string", mapping: "property" },
            /**
             * Defines the scope of the search item
             */
            scopeName: { type: "string", mapping: "property" },
            /**
             * Defines whether the search item is selected.
             */
            selected: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the heading text of the search item.
             */
            text: { type: "string", mapping: "property" },
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
             * Defines the actionable elements.
             * This slot allows placing additional interactive elements (such as buttons, icons, or tags)
             * next to the delete button, providing flexible customization for various user actions.
             *
             * **Note:** While the slot is flexible, for consistency with design guidelines,
             * it's recommended to use `ui5-button` with `Transparent` design or `ui5-icon` elements.
             * @type module:sap/ui/core/Control
             */
            actions: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "actions"
            },
            /**
             * **Note:** While the slot allows the option of setting a custom avatar, to comply with the
             * design guidelines, use the `ui5-avatar` with size - XS.
             * @type module:sap/ui/core/Control
             */
            image: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "image"
            }
          },

          associations: {},

          events: {
            /**
             * Fired when delete button is pressed.
             */
            delete: {
              parameters: {}
            },

            /**
             * Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.
             *
             * **Note:** The event will not be fired if the `disabled` property is set to `true`.
             */
            click: {
              enableEventBubbling: true,
              parameters: {
                /**
                 * The original event from the user interaction.
                 */
                originalEvent: {
                  type: "object",
                  types: [
                    {
                      origType: "Event",
                      multiple: false,
                      dedicatedTypes: [{ dtsType: "Event", ui5Type: "object" }]
                    }
                  ],
                  dtsParamDescription:
                    "The original event from the user interaction."
                }
              }
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return SearchItem;
  }
);
