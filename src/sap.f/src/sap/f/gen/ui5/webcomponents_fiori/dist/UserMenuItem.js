/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/MenuItem",
    "sap/ui/core/EnabledPropagator",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/UserMenuItem"
  ],
  function (MenuItem, EnabledPropagator) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * `ui5-user-menu-item` is the item to use inside a `ui5-user-menu`.
     * An arbitrary hierarchy structure can be represented by recursively nesting menu items.
     *
     * ### Usage
     *
     * `ui5-user-menu-item` represents a node in a `ui5-user-menu`. The user menu itself is rendered as a list,
     * and each `ui5-menu-item` is represented by a menu item in that menu. Therefore, you should only use
     * `ui5-user-menu-item` directly in your apps. The `ui5-menu` menu item is internal for the menu, and not intended for public use.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/UserMenuItem.js";`
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/MenuItem
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/UserMenuItem
     */

    const UserMenuItem = MenuItem.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuItem",
      {
        metadata: {
          tag: "ui5-user-menu-item-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/UserMenuItem.designtime",

          interfaces: [],

          defaultAggregation: "items",

          properties: {
            /**
             * When set, a second line appears below the menu item text showing the text
             * of the currently selected sub-item. Intended for use with a single-select
             * ui5-menu-item-group (check-mode="Single").
             * When enabled, the checked sub-item cannot be unchecked,
             * ensuring the selection text is always displayed.
             */
            showSelection: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the additional accessibility attributes that will be applied to the component.
             * The following fields are supported:
             *
             * - **ariaKeyShortcuts**: Indicated the availability of a keyboard shortcuts defined for the menu item.
             *
             * - **role**: Defines the role of the menu item. If not set, menu item will have default role="menuitem".
             */
            accessibilityAttributes: {
              type: "any",
              mapping: "property",
              defaultValue: {}
            },
            /**
             * Defines the accessible ARIA name of the component.
             */
            accessibleName: { type: "string", mapping: "property" },
            /**
             * Used to define the role of the list item.
             *
             * **Note:** If not set, the role is automatically inherited from the parent `ui5-list` based on its `accessible-role` property
             * (e.g. `Menu` -> `MenuItem`, `Tree` -> `TreeItem`, `ListBox` -> `Option`).
             * An explicitly set `accessible-role` on the list item takes precedence over the inherited role.
             * @type module:sap/f/gen/ui5/webcomponents/dist/types/ListItemAccessibleRole
             */
            accessibleRole: {
              type: "sap.f.gen.ui5.webcomponents.dist.types.ListItemAccessibleRole",
              mapping: "property"
            },
            /**
             * Defines the `additionalText`, displayed in the end of the menu item.
             *
             * **Note:** The additional text will not be displayed if there are items added in `items` slot or there are
             * components added to `endContent` slot.
             *
             * The priority of what will be displayed at the end of the menu item is as follows:
             * sub-menu arrow (if there are items added in `items` slot) -> components added in `endContent` -> text set to `additionalText`.
             */
            additionalText: { type: "string", mapping: "property" },
            /**
             * Defines whether menu item is in checked state.
             *
             * **Note:** checked state is only taken into account when menu item is added to menu item group
             * with `checkMode` other than `None`.
             *
             * **Note:** A checked menu item has a checkmark displayed at its end.
             */
            checked: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines whether menu item is in disabled state.
             *
             * **Note:** A disabled menu item is noninteractive.
             */
            enabled: {
              type: "boolean",
              defaultValue: true,
              mapping: {
                type: "property",
                to: "disabled",
                formatter: "_mapEnabled"
              }
            },
            /**
             * Defines the highlight state of the list items.
             * Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`.
             * @type module:sap/f/gen/ui5/webcomponents/dist/types/Highlight
             */
            highlight: {
              type: "sap.f.gen.ui5.webcomponents.dist.types.Highlight",
              mapping: "property",
              defaultValue: "None"
            },
            /**
             * Defines the icon to be displayed as graphical element within the component.
             * The SAP-icons font provides numerous options.
             *
             * **Example:**
             *
             * See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html).
             */
            icon: { type: "string", mapping: "property" },
            /**
             * Defines the delay in milliseconds, after which the loading indicator will be displayed inside the corresponding menu popover.
             *
             * **Note:** If set to `true` a busy indicator component will be displayed into the related one to the current menu item sub-menu popover.
             */
            loading: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the delay in milliseconds, after which the loading indicator will be displayed inside the corresponding menu popover.
             */
            loadingDelay: {
              type: "float",
              mapping: "property",
              defaultValue: 1000
            },
            /**
             * The navigated state of the list item.
             * If set to `true`, a navigation indicator is displayed at the end of the list item.
             */
            navigated: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the selected state of the component.
             */
            selected: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the text of the tree item.
             */
            text: { type: "string", mapping: "property" },
            /**
             * Defines the visual indication and behavior of the list items.
             * Available options are `Active` (by default), `Inactive`, `InactiveSelectable`, `Detail` and `Navigation`.
             *
             * **Note:** When set to `Active` or `Navigation`, the item will provide visual response upon press and hover,
             * while with type `Inactive`, `InactiveSelectable` and `Detail` - will not.
             *
             * **Note:** `InactiveSelectable` behaves like `Inactive` (no active press/hover feedback and the
             * `item-click` event is not fired), but the item can still be selected. Clicking the item body,
             * pressing Space/Enter, or interacting with the selection component (checkbox in Multi mode, radio
             * button in Single modes) toggles the selection when the list has a selection mode.
             * @type module:sap/f/gen/ui5/webcomponents/dist/types/ListItemType
             */
            type: {
              type: "sap.f.gen.ui5.webcomponents.dist.types.ListItemType",
              mapping: "property",
              defaultValue: "Active"
            }
          },

          aggregations: {
            /**
             * Defines the items of this component.
             *
             * **Note:** Use `ui5-user-menu-item` for the intended design.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/UserMenuItem
             */
            items: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuItem",
              multiple: true
            },
            /**
             * Defines the delete button, displayed in "Delete" mode.
             * **Note:** While the slot allows custom buttons, to match
             * design guidelines, please use the `ui5-button` component.
             * **Note:** When the slot is not present, a built-in delete button will be displayed.
             * @type sap/f/gen/ui5/webcomponents/dist/Button
             */
            deleteButton: {
              type: "sap.f.gen.ui5.webcomponents.dist.Button.IButton",
              multiple: true,
              slot: "deleteButton"
            },
            /**
             * Defines the components that should be displayed at the end of the menu item.
             *
             * **Note:** It is highly recommended to slot only components of type `ui5-button`,`ui5-link`
             * or `ui5-icon` in order to preserve the intended design. If there are components added to this slot,
             * and there is text set in `additionalText`, it will not be displayed. If there are items added to `items` slot,
             * nether `additionalText` nor components added to this slot would be displayed.
             *
             * The priority of what will be displayed at the end of the menu item is as follows:
             * sub-menu arrow (if there are items added in `items` slot) -> components added in `endContent` -> text set to `additionalText`.
             *
             * Application developers are responsible for ensuring that interactive elements placed in the `endContent` slot
             * have the correct accessibility behaviour, including their enabled or disabled states.
             * The menu does not manage these aspects when the menu item state changes.
             * @type module:sap/ui/core/Control
             */
            endContent: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "endContent"
            }
          },

          associations: {},

          events: {
            /**
             * Fired before the menu is closed. This event can be cancelled, which will prevent the menu from closing.
             */
            beforeClose: {
              allowPreventDefault: true,
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
                      dedicatedTypes: [
                        { dtsType: "boolean", ui5Type: "boolean" }
                      ]
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
              parameters: {
                /**
                 * The menu item that triggers opening of the sub-menu or undefined when fired upon root menu opening.
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
                    "The menu item that triggers opening of the sub-menu or undefined when fired upon root menu opening."
                }
              }
            },

            /**
             * Fired when an item is checked or unchecked.
             */
            check: {
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
            },

            /**
             * Fired after the menu is closed.
             */
            close: {
              parameters: {}
            },

            /**
             * Fired when the user clicks on the detail button when type is `Detail`.
             */
            detailClick: {
              enableEventBubbling: true,
              parameters: {}
            },

            /**
             * Fired after the menu is opened.
             */
            open: {
              parameters: {}
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    EnabledPropagator.call(UserMenuItem.prototype);

    return UserMenuItem;
  }
);
