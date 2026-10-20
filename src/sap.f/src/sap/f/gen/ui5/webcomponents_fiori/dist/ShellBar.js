/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/ShellBar"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-shellbar` is meant to serve as an application header
     * and includes numerous built-in features, such as: logo, profile image/icon, title, search field, notifications and so on.
     *
     * ### Stable DOM Refs
     *
     * You can use the following stable DOM refs for the `ui5-shellbar`:
     *
     * - logo
     * - notifications
     * - overflow
     * - profile
     * - product-switch
     *
     * ### Keyboard Handling
     *
     * #### Fast Navigation
     * This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
     * In order to use this functionality, you need to import the following module:
     * `import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/ShellBar.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBar
     */

    const ShellBar = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.ShellBar",
      {
        metadata: {
          tag: "ui5-shellbar-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime: "sap/f/gen/ui5/webcomponents_fiori/designtime/ShellBar.designtime",

          interfaces: ["sap.m.IBar"],

          defaultAggregation: "items",

          properties: {
            /**
             * Defines additional accessibility attributes on different areas of the component.
             *
             * The accessibilityAttributes object has the following fields,
             * where each field is an object supporting one or more accessibility attributes:
             *
             * - **logo** - `logo.role` and `logo.name`.
             * - **notifications** - `notifications.expanded` and `notifications.hasPopup`.
             * - **profile** - `profile.expanded`, `profile.hasPopup` and `profile.name`.
             * - **product** - `product.expanded` and `product.hasPopup`.
             * - **search** - `search.hasPopup`.
             * - **overflow** - `overflow.expanded` and `overflow.hasPopup`.
             * - **branding** - `branding.name`.
             *
             * The accessibility attributes support the following values:
             *
             * - **role**: Defines the accessible ARIA role of the logo area.
             * Accepts the following string values: `button` or `link`.
             *
             * - **expanded**: Indicates whether the button, or another grouping element it controls,
             * is currently expanded or collapsed.
             * Accepts the following string values: `true` or `false`.
             *
             * - **hasPopup**: Indicates the availability and type of interactive popup element,
             * such as menu or dialog, that can be triggered by the button.
             *
             * Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.
             * - **name**: Defines the accessible ARIA name of the area.
             * Accepts any string.
             */
            accessibilityAttributes: {
              type: "any",
              mapping: "property",
              defaultValue: {}
            },
            /**
             * Disables the automatic search field expansion/collapse when the available space is not enough.
             *
             * **Note:** The `disableSearchCollapse` property is in an experimental state and is a subject to change.
             */
            disableSearchCollapse: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the visibility state of the search button.
             *
             * **Note:** The `hideSearchButton` property is in an experimental state and is a subject to change.
             */
            hideSearchButton: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the `notificationsCount`,
             * displayed in the notification icon top-right corner.
             */
            notificationsCount: { type: "string", mapping: "property" },
            /**
             * Defines the `primaryTitle`.
             *
             * **Note:** The `primaryTitle` would be hidden on S screen size (less than approx. 700px).
             */
            primaryTitle: { type: "string", mapping: "property" },
            /**
             * Defines the `secondaryTitle`.
             *
             * **Note:** The `secondaryTitle` would be hidden on S and M screen sizes (less than approx. 1300px).
             */
            secondaryTitle: { type: "string", mapping: "property" },
            /**
             * Defines, if the notification icon would be displayed.
             */
            showNotifications: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines, if the product switch icon would be displayed.
             */
            showProductSwitch: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines, if the Search Field would be displayed when there is a valid `searchField` slot.
             *
             * **Note:** By default the Search Field is not displayed.
             */
            showSearchField: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
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
             * Defines the assistant slot.
             * @type sap/f/gen/ui5/webcomponents/dist/Button
             */
            assistant: {
              type: "sap.f.gen.ui5.webcomponents.dist.Button.IButton",
              multiple: true,
              slot: "assistant"
            },
            /**
             * Defines the branding slot.
             * The `ui5-shellbar-branding` component is intended to be placed inside this slot.
             * Content placed here takes precedence over the `primaryTitle` property and the `logo` content slot.
             *
             * **Note:** The `branding` slot is in an experimental state and is a subject to change.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBarBranding
             */
            branding: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.ShellBarBranding",
              multiple: true,
              slot: "branding"
            },
            /**
             * Define the items displayed in the content area.
             *
             * Use the `data-hide-order` attribute with numeric value to specify the order of the items to be hidden when the space is not enough.
             * Lower values will be hidden first.
             *
             * **Note:** The `content` slot is in an experimental state and is a subject to change.
             * @type module:sap/ui/core/Control
             */
            content: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "content"
            },
            /**
             * Defines the `ui5-shellbar` additional items.
             *
             * **Note:**
             * You can use the `<ui5-shellbar-item></ui5-shellbar-item>`.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBarItem
             */
            items: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.ShellBarItem",
              multiple: true
            },
            /**
             * Defines the logo of the `ui5-shellbar`.
             * For example, you can use `ui5-avatar` or `img` elements as logo.
             * @type module:sap/ui/core/Control
             */
            logo: { type: "sap.ui.core.Control", multiple: true, slot: "logo" },
            /**
             * Defines the items displayed in menu after a click on a start button.
             *
             * **Note:** You can use the  `<ui5-li></ui5-li>` and its ancestors.
             * @type module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
             */
            menuItems: {
              type: "sap.f.gen.ui5.webcomponents.dist.ListItemBase",
              multiple: true,
              slot: "menuItems"
            },
            /**
             * You can pass `ui5-avatar` to set the profile image/icon.
             * If no profile slot is set - profile will be excluded from actions.
             *
             * **Note:** We recommend not using the `size` attribute of `ui5-avatar` because
             * it should have specific size by design in the context of `ui5-shellbar` profile.
             * @type module:sap/ui/core/Control
             */
            profile: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "profile"
            },
            /**
             * Defines the `ui5-input`, that will be used as a search field.
             */
            searchField: { multiple: true, slot: "searchField" },
            /**
             * Defines a `ui5-button` in the bar that will be placed in the beginning.
             * We encourage this slot to be used for a menu button.
             * It gets overstyled to match ShellBar's styling.
             * @type sap/f/gen/ui5/webcomponents/dist/Button
             */
            startButton: {
              type: "sap.f.gen.ui5.webcomponents.dist.Button.IButton",
              multiple: true,
              slot: "startButton"
            }
          },

          associations: {},

          events: {
            /**
             * Fired, when an item from the content slot is hidden or shown.
             * **Note:** The `content-item-visibility-change` event is in an experimental state and is a subject to change.
             */
            contentItemVisibilityChange: {
              enableEventBubbling: true,
              parameters: {
                /**
                 * of all the items that are hidden
                 */
                array: {
                  type: "sap.ui.core.Control",
                  types: [
                    {
                      origType: "HTMLElement",
                      multiple: true,
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
                  dtsParamDescription: "of all the items that are hidden"
                }
              }
            },

            /**
             * Fired, when the logo is activated.
             */
            logoClick: {
              enableEventBubbling: true,
              parameters: {
                /**
                 * dom ref of the activated element
                 */
                targetRef: {
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
                  dtsParamDescription: "dom ref of the activated element"
                }
              }
            },

            /**
             * Fired, when a menu item is activated
             *
             * **Note:** You can prevent closing of overflow popover by calling `event.preventDefault()`.
             */
            menuItemClick: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                /**
                 * DOM ref of the activated list item
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
                  dtsParamDescription: "DOM ref of the activated list item"
                }
              }
            },

            /**
             * Fired, when the notification icon is activated.
             */
            notificationsClick: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                /**
                 * dom ref of the activated element
                 */
                targetRef: {
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
                  dtsParamDescription: "dom ref of the activated element"
                }
              }
            },

            /**
             * Fired, when the product switch icon is activated.
             *
             * **Note:** You can prevent closing of overflow popover by calling `event.preventDefault()`.
             */
            productSwitchClick: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                /**
                 * dom ref of the activated element
                 */
                targetRef: {
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
                  dtsParamDescription: "dom ref of the activated element"
                }
              }
            },

            /**
             * Fired, when the profile slot is present.
             */
            profileClick: {
              enableEventBubbling: true,
              parameters: {
                /**
                 * dom ref of the activated element
                 */
                targetRef: {
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
                  dtsParamDescription: "dom ref of the activated element"
                }
              }
            },

            /**
             * Fired, when the search button is activated.
             *
             * **Note:** You can prevent expanding/collapsing of the search field by calling `event.preventDefault()`.
             */
            searchButtonClick: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                /**
                 * whether the search field is visible
                 */
                searchFieldVisible: {
                  type: "boolean",
                  types: [
                    {
                      origType: "Boolean",
                      multiple: false,
                      dedicatedTypes: [
                        { dtsType: "boolean", ui5Type: "boolean" }
                      ]
                    }
                  ],
                  dtsParamDescription: "whether the search field is visible"
                },
                /**
                 * dom ref of the activated element
                 */
                targetRef: {
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
                  dtsParamDescription: "dom ref of the activated element"
                }
              }
            },

            /**
             * Fired, when the search cancel button is activated.
             *
             * **Note:** You can prevent the default behavior (clearing the search field value) by calling `event.preventDefault()`. The search will still be closed.
             * **Note:** The `search-field-clear` event is in an experimental state and is a subject to change.
             */
            searchFieldClear: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                /**
                 * dom ref of the cancel button element
                 */
                targetRef: {
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
                  dtsParamDescription: "dom ref of the cancel button element"
                }
              }
            },

            /**
             * Fired, when the search field is expanded or collapsed.
             */
            searchFieldToggle: {
              enableEventBubbling: true,
              parameters: {
                /**
                 * whether the search field is expanded
                 */
                expanded: {
                  type: "boolean",
                  types: [
                    {
                      origType: "Boolean",
                      multiple: false,
                      dedicatedTypes: [
                        { dtsType: "boolean", ui5Type: "boolean" }
                      ]
                    }
                  ],
                  dtsParamDescription: "whether the search field is expanded"
                }
              }
            }
          },

          getters: [
            /**
             * Returns the `logo` DOM ref.
             *
             * @private
             * @ui5-restricted sap.ushell,sap.esh.search.ui
             * @name module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBar#getLogoDomRef
             * @function
             */

            "logoDomRef",
            /**
             * Returns the `notifications` icon DOM ref.
             *
             * @private
             * @ui5-restricted sap.ushell,sap.esh.search.ui
             * @name module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBar#getNotificationsDomRef
             * @function
             */

            "notificationsDomRef",
            /**
             * Returns the `overflow` icon DOM ref.
             *
             * @private
             * @ui5-restricted sap.ushell,sap.esh.search.ui
             * @name module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBar#getOverflowDomRef
             * @function
             */

            "overflowDomRef",
            /**
             * Returns the `product-switch` icon DOM ref.
             *
             * @private
             * @ui5-restricted sap.ushell,sap.esh.search.ui
             * @name module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBar#getProductSwitchDomRef
             * @function
             */

            "productSwitchDomRef",
            /**
             * Returns the `profile` icon DOM ref.
             *
             * @private
             * @ui5-restricted sap.ushell,sap.esh.search.ui
             * @name module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBar#getProfileDomRef
             * @function
             */

            "profileDomRef"
          ],

          methods: [
            /**
             * Closes the overflow popover.
             *
             * @private
             * @ui5-restricted sap.ushell,sap.esh.search.ui
             * @name module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBar#closeOverflow
             * @function
             */

            "closeOverflow",
            /**
             * Returns the search button DOM reference.
             *
             * @private
             * @ui5-restricted sap.ushell,sap.esh.search.ui
             * @name module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBar#getSearchButtonDomRef
             * @function
             */

            "getSearchButtonDomRef"
          ]
        }
      }
    );

    return ShellBar;
  }
);
