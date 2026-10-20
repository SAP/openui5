/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents_fiori/dist/NotificationListItemBase",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/NotificationListGroupItem"
  ],
  function (NotificationListItemBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     * The `ui5-li-notification-group` is a special type of list item,
     * that unlike others can group items within self, usually `ui5-li-notification` items.
     *
     * The component consists of:
     *
     * - `Toggle` button to expand and collapse the group
     * - `TitleText` to entitle the group
     * - Items of the group
     *
     * ### Usage
     * The component should be used inside a `ui5-notification-list`.
     *
     * ### Keyboard Handling
     * The `ui5-li-notification-group` provides advanced keyboard handling.
     * This component provides fast navigation when the header is focused using the following keyboard shortcuts:
     *
     * - [Space] - toggles expand / collapse of the group
     * - [Plus] - expands the group
     * - [Minus] - collapses the group
     * - [Right] - expands the group
     * - [Left] - collapses the group
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/NotificationListGroupItem.js";`
     *
     * @extends module:sap/f/gen/ui5/webcomponents_fiori/dist/NotificationListItemBase
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/NotificationListGroupItem
     */

    const NotificationListGroupItem = NotificationListItemBase.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationListGroupItem",
      {
        metadata: {
          tag: "ui5-li-notification-group-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/NotificationListGroupItem.designtime",

          interfaces: [],

          defaultAggregation: "items",

          properties: {
            /**
             * Defines if the group is collapsed or expanded.
             */
            collapsed: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines whether the component will have growing capability by pressing a `More` button.
             * When button is pressed `load-more` event will be fired.
             * @type module:sap/f/gen/ui5/webcomponents/dist/types/NotificationListGrowingMode
             */
            growing: {
              type: "sap.f.gen.ui5.webcomponents.dist.types.NotificationListGrowingMode",
              mapping: "property",
              defaultValue: "None"
            },
            /**
             * Defines if a busy indicator would be displayed over the item.
             */
            loading: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the delay in milliseconds, after which the busy indicator will show up for this component.
             */
            loadingDelay: {
              type: "float",
              mapping: "property",
              defaultValue: 1000
            },
            /**
             * Defines if the `notification` is new or has been already read.
             *
             * **Note:** if set to `false` the `titleText` has bold font,
             * if set to true - it has a normal font.
             */
            read: { type: "boolean", mapping: "property", defaultValue: false },
            /**
             * Defines the `titleText` of the item.
             */
            titleText: { type: "string", mapping: "property" },
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
             * Defines the items of the `ui5-li-notification-group`,
             * usually `ui5-li-notification` items.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/NotificationListItem
             */
            items: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationListItem",
              multiple: true
            }
          },

          associations: {},

          events: {
            /**
             * Fired when additional items are requested.
             */
            loadMore: {
              enableEventBubbling: true,
              parameters: {}
            },

            /**
             * Fired when the `ui5-li-notification-group` is expanded/collapsed by user interaction.
             */
            toggle: {
              enableEventBubbling: true,
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

    return NotificationListGroupItem;
  }
);
