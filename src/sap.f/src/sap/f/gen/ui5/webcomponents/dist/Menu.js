/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents",
    "sap/f/thirdparty/Menu"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * `ui5-menu` component represents a hierarchical menu structure.
     *
     * ### Structure
     *
     * The `ui5-menu` can hold two types of entities:
     *
     * - `ui5-menu-item` components
     * - `ui5-menu-separator` - used to separate menu items with a line
     *
     * An arbitrary hierarchy structure can be represented by recursively nesting menu items.
     *
     * ### Keyboard Handling
     *
     * The `ui5-menu` provides advanced keyboard handling.
     * The user can use the following keyboard shortcuts in order to navigate trough the tree:
     *
     * - `Arrow Up` / `Arrow Down` - Navigates up and down the menu items that are currently visible.
     * - `Arrow Right`, `Space` or `Enter` - Opens a sub-menu if there are menu items nested
     * in the currently clicked menu item.
     * - `Arrow Left` or `Escape` - Closes the currently opened sub-menu.
     *
     * when there is `endContent` :
     * - `Arrow Left` or `ArrowRight` - Navigate between the menu item actions and the menu item itself
     * - `Arrow Up` / `Arrow Down` - Navigates up and down the currently visible menu items
     *
     * **Note:** If the text direction is set to Right-to-left (RTL), `Arrow Right` and `Arrow Left` functionality is swapped.
     *
     * Application developers are responsible for ensuring that interactive elements placed in the `endContent` slot
     * have the correct accessibility behaviour, including their enabled or disabled states.
     * The menu does not manage these aspects when the menu item state changes.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Menu.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents/dist/Menu
     */

    const Menu = WebComponent.extend("sap.f.gen.ui5.webcomponents.dist.Menu", {
      metadata: {
        tag: "ui5-menu-29d33248",

        namespace: "sap.f.gen.ui5.webcomponents",

        library: "sap.f",

        designtime: "sap/f/gen/ui5/webcomponents/designtime/Menu.designtime",

        interfaces: [],

        defaultAggregation: "items",

        properties: {
          /**
           * Defines the header text of the menu (displayed on mobile).
           */
          headerText: { type: "string", mapping: "property" },
          /**
           * Determines the horizontal alignment of the menu relative to its opener control.
           * @type module:sap/f/gen/ui5/webcomponents/dist/types/PopoverHorizontalAlign
           */
          horizontalAlign: {
            type: "sap.f.gen.ui5.webcomponents.dist.types.PopoverHorizontalAlign",
            mapping: "property",
            defaultValue: "Start"
          },
          /**
           * Defines if a loading indicator would be displayed inside the corresponding ui5-menu popover.
           */
          loading: {
            type: "boolean",
            mapping: "property",
            defaultValue: false
          },
          /**
           * Defines the delay in milliseconds, after which the loading indicator will be displayed inside the corresponding ui5-menu popover.
           */
          loadingDelay: {
            type: "float",
            mapping: "property",
            defaultValue: 1000
          },
          /**
           * Indicates if the menu is open.
           */
          open: { type: "boolean", mapping: "property", defaultValue: false },
          /**
           * Determines on which side the component is placed at.
           * @type module:sap/f/gen/ui5/webcomponents/dist/types/PopoverPlacement
           */
          placement: {
            type: "sap.f.gen.ui5.webcomponents.dist.types.PopoverPlacement",
            mapping: "property",
            defaultValue: "Bottom"
          },
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
           * Defines the items of this component.
           *
           * **Note:** Use `ui5-menu-item` and `ui5-menu-separator` for their intended design.
           * @type sap/f/gen/ui5/webcomponents/dist/Menu
           */
          items: {
            type: "sap.f.gen.ui5.webcomponents.dist.Menu.IMenuItem",
            multiple: true
          }
        },

        associations: {
          /**
           * Defines the ID or DOM Reference of the element at which the menu is shown.
           * When using this attribute in a declarative way, you must only use the `id` (as a string) of the element at which you want to show the popover.
           * You can only set the `opener` attribute to a DOM Reference when using JavaScript.
           */
          opener: {
            type: "sap.ui.core.Control",
            mapping: { type: "property", to: "opener" }
          }
        },

        events: {
          /**
           * Fired before the menu is closed. This event can be cancelled, which will prevent the menu from closing.
           */
          beforeClose: {
            allowPreventDefault: true,
            enableEventBubbling: true,
            parameters: {
              /**
               * Indicates that `ESC` key has triggered the event.
               */
              escPressed: {
                type: "boolean",
                types: [
                  {
                    origType: "boolean",
                    multiple: false,
                    dedicatedTypes: [{ dtsType: "boolean", ui5Type: "boolean" }]
                  }
                ],
                dtsParamDescription:
                  "Indicates that `ESC` key has triggered the event."
              }
            }
          },

          /**
           * Fired before the menu is opened. This event can be cancelled, which will prevent the menu from opening.
           *
           * **Note:** Since 1.14.0 the event is also fired before a sub-menu opens.
           */
          beforeOpen: {
            allowPreventDefault: true,
            enableEventBubbling: true,
            parameters: {
              /**
               * The `ui5-menu-item` that triggers opening of the sub-menu or undefined when fired upon root menu opening.
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
                dtsParamDescription:
                  "The `ui5-menu-item` that triggers opening of the sub-menu or undefined when fired upon root menu opening."
              }
            }
          },

          /**
           * Fired after the menu is closed.
           */
          close: {
            parameters: {}
          },

          /**
           * Fired when an item is being clicked.
           *
           * **Note:** Since 1.17.0 the event is preventable, allowing the menu to remain open after an item is pressed.
           */
          itemClick: {
            allowPreventDefault: true,
            parameters: {
              /**
               * The currently clicked menu item.
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
                dtsParamDescription: "The currently clicked menu item."
              },
              /**
               * The text of the currently clicked menu item.
               */
              text: {
                type: "string",
                types: [
                  {
                    origType: "string",
                    multiple: false,
                    dedicatedTypes: [{ dtsType: "string", ui5Type: "string" }]
                  }
                ],
                dtsParamDescription:
                  "The text of the currently clicked menu item."
              }
            }
          },

          /**
           * Fired after the menu is opened.
           */
          onOpen: {
            enableEventBubbling: true,
            mapping: "open",
            parameters: {}
          }
        },

        getters: [],

        methods: []
      }
    });

    return Menu;
  }
);
