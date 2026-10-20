/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents_fiori/dist/NotificationListItemBase",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/NotificationListItem"
  ],
  function (NotificationListItemBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     * The `ui5-li-notification` is a type of list item, meant to display notifications.
     *
     * The component has a rich set of various properties that allows the user to set `avatar`, `menu`, `titleText`, descriptive `content`
     * and `footnotes` to fully describe a notification.
     *
     * The user can:
     *
     * - display a `Close` button
     * - can control whether the `titleText` and `description` should wrap or truncate
     * and display a `ShowMore` button to switch between less and more information
     * - add actions by using the `ui5-menu` component
     *
     * **Note:** Adding custom actions by using the `ui5-notification-action` component is deprecated as of version 2.0!
     *
     * ### Usage
     * The component should be used inside a `ui5-notification-list`.
     *
     * ### Keyboard Handling
     *
     * #### Basic Navigation
     * The user can use the following keyboard shortcuts to perform actions (such as select, delete):
     *
     * - [Enter] - select an item (trigger "item-click" event)
     * - [Delete] - close an item (trigger "item-close" event)
     *
     * #### Fast Navigation
     * This component provides a fast navigation using the following keyboard shortcuts:
     *
     * - [Shift] + [Enter] - 'More'/'Less' link will be triggered
     * - [Shift] + [F10] - 'Menu' (Actions) button will be triggered (clicked)
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/NotificationListItem.js";`
     *
     * @extends module:sap/f/gen/ui5/webcomponents_fiori/dist/NotificationListItemBase
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/NotificationListItem
     */

    const NotificationListItem = NotificationListItemBase.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationListItem",
      {
        metadata: {
          tag: "ui5-li-notification-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/NotificationListItem.designtime",

          interfaces: [],

          defaultAggregation: "description",

          properties: {
            /**
             * Defines the `Important` label of the item.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/types/NotificationListItemImportance
             */
            importance: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.types.NotificationListItemImportance",
              mapping: "property",
              defaultValue: "Standard"
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
             * Defines if the `Close` button would be displayed.
             */
            showClose: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the status indicator of the item.
             * @type module:sap/ui/core/ValueState
             */
            state: {
              type: "sap.ui.core.ValueState",
              mapping: {
                formatter: "_mapValueState",
                parser: "_parseValueState"
              },
              defaultValue: "None"
            },
            /**
             * Defines the `titleText` of the item.
             */
            titleText: { type: "string", mapping: "property" },
            /**
             * Defines if the `titleText` and `description` should wrap,
             * they truncate by default.
             *
             * **Note:** by default the `titleText` and `description`,
             * and a `ShowMore/Less` button would be displayed.
             * @type module:sap/f/gen/ui5/webcomponents/dist/types/WrappingType
             */
            wrappingType: {
              type: "sap.f.gen.ui5.webcomponents.dist.types.WrappingType",
              mapping: "property",
              defaultValue: "None"
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
             * Defines the avatar, displayed in the `ui5-li-notification`.
             *
             * **Note:** Consider using the `ui5-avatar` to display icons, initials or images.
             *
             * **Note:** In order to be complaint with the UX guidlines and for best experience,
             * we recommend using avatars with 2rem X 2rem in size (32px X 32px). In case you are using the `ui5-avatar`
             * you can set its `size` property to `XS` to get the required size - `<ui5-avatar size="XS"></ui5-avatar>`.
             * @type module:sap/ui/core/Control
             */
            avatar: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "avatar"
            },
            /**
             * Defines the content of the `ui5-li-notification`,
             * usually a description of the notification.
             *
             * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
             * @type module:sap/ui/core/Control
             */
            description: { type: "sap.ui.core.Control", multiple: true },
            /**
             * Defines the elements, displayed in the footer of the of the component.
             * @type module:sap/ui/core/Control
             */
            footnotes: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "footnotes"
            },
            /**
             * Defines the menu, displayed in the `ui5-li-notification`.
             *
             * **Note:** Use this for implementing actions.
             *
             * **Note:** Should be used instead `u5-notification-action`, which is deprecated as of version 2.0.
             * @type module:sap/ui/core/Control
             */
            menu: { type: "sap.ui.core.Control", multiple: true, slot: "menu" }
          },

          associations: {},

          events: {
            /**
             * Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.
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
            },

            /**
             * Fired when the `Close` button is pressed.
             */
            close: {
              parameters: {
                /**
                 * the closed item.
                 */
                item: {
                  type: "sap.ui.core.Control",
                  types: [
                    {
                      origType: "HTMLElement",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "Control",
                          packageName: "sap/ui/core/Control",
                          moduleType: "module:sap/ui/core/Control",
                          ui5Type: "sap.ui.core.Control",
                          isClass: true
                        }
                      ]
                    }
                  ],
                  dtsParamDescription: "the closed item."
                }
              }
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return NotificationListItem;
  }
);
