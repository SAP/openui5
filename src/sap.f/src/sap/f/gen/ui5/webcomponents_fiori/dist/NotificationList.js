/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/NotificationList"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     * The `ui5-notification-list` web component represents
     * a container for `ui5-li-notification-group` and `ui5-li-notification`.
     *
     * ### Keyboard Handling
     *
     * #### Basic Navigation
     * The `ui5-notification-list` provides advanced keyboard handling.
     * When a list is focused the user can use the following keyboard
     * shortcuts in order to perform a navigation:
     *
     * - [Up] or [Left] - Navigates up the items
     * - [Down] or [Right] - Navigates down the items
     * - [Home] - Navigates to first item
     * - [End] - Navigates to the last item
     *
     * #### Fast Navigation
     * This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
     * In order to use this functionality, you need to import the following module:
     * `import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/NotificationList.js";``
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/NotificationList
     */

    const NotificationList = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationList",
      {
        metadata: {
          tag: "ui5-notification-list-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/NotificationList.designtime",

          interfaces: [],

          defaultAggregation: "items",

          properties: {
            /**
             * Defines the text that is displayed when the component contains no items.
             */
            noDataText: { type: "string", mapping: "property" },
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

          aggregations: {
            /**
             * Defines the items of the component.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/NotificationListItemBase
             */
            items: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationListItemBase",
              multiple: true
            }
          },

          associations: {},

          events: {
            /**
             * Fired when an item is clicked.
             */
            itemClick: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                /**
                 * The clicked item.
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
                  dtsParamDescription: "The clicked item."
                }
              }
            },

            /**
             * Fired when the `Close` button of any item is clicked.
             */
            itemClose: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                /**
                 * the item about to be closed.
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
                  dtsParamDescription: "the item about to be closed."
                }
              }
            },

            /**
             * Fired when an item is toggled.
             */
            itemToggle: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                /**
                 * the toggled item.
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
                  dtsParamDescription: "the toggled item."
                }
              }
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return NotificationList;
  }
);
