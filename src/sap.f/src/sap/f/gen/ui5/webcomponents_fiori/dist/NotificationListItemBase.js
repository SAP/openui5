/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/ListItemBase",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/NotificationListItem"
  ],
  function (ListItemBase) {
    "use strict";

    /**
     * @class
     * The base class of the `NotificationListItem` and `NotificationListGroupItem`.
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/NotificationListItemBase
     */

    const NotificationListItemBase = ListItemBase.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationListItemBase",
      {
        metadata: {
          tag: "",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/NotificationListItemBase.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
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
            titleText: { type: "string", mapping: "property" }
          },

          aggregations: {},

          associations: {},

          events: {
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

    return NotificationListItemBase;
  }
);
