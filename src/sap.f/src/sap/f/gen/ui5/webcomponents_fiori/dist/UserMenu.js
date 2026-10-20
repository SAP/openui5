/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/UserMenu"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-menu` is an SAP Fiori specific web component that is used in `ui5-shellbar`
     * and allows the user to easily see information and settings for the current user and all other logged in accounts.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserMenu.js";`
     *
     * `import "@ui5/webcomponents-fiori/dist/UserMenuItem.js";` (for `ui5-user-menu-item`)
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/UserMenu
     */

    const UserMenu = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenu",
      {
        metadata: {
          tag: "ui5-user-menu-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime: "sap/f/gen/ui5/webcomponents_fiori/designtime/UserMenu.designtime",

          interfaces: [],

          defaultAggregation: "menuItems",

          properties: {
            /**
             * Defines whether the avatar of the selected account is interactive (focusable and pressable).
             *
             * When `false` (default), the avatar is rendered as a non-interactive image
             * and is not announced as a button by screen readers.
             *
             * **Note:** When `showEditButton` is set to `true`, the avatar is treated as interactive
             * regardless of this property's value, to preserve the edit affordance.
             */
            avatarInteractive: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines if the User Menu is opened.
             */
            open: { type: "boolean", mapping: "property", defaultValue: false },
            /**
             * Defines if the User Menu shows the Edit Accounts option.
             */
            showEditAccounts: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines if the User menu shows edit button.
             */
            showEditButton: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines if the User Menu shows the Manage Account option.
             */
            showManageAccount: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines if the User Menu shows the Other Accounts option.
             */
            showOtherAccounts: {
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
             * Defines the user accounts.
             *
             * **Note:** If one item is used, it will be shown as the selected one. If more than one item is used, the first one will be shown as selected unless
             * there is an item with `selected` property set to `true`.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/UserMenuAccount
             */
            accounts: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuAccount",
              multiple: true,
              slot: "accounts"
            },
            /**
             * Defines the menu items.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/UserMenuItem
             */
            menuItems: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuItem",
              multiple: true
            },
            /**
             * Defines custom footer content.
             *
             * **Note:** When provided, replaces the default "Sign Out" button. Use an empty element to hide the footer completely.
             * @type module:sap/ui/core/Control
             */
            footer: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "footer"
            },
            /**
             * Defines the content of the info area inside the User Menu's account block.
             *
             * **Note:** When empty, the User Menu renders unchanged.
             * @type module:sap/ui/core/Control
             */
            infoArea: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "infoArea"
            }
          },

          associations: {
            /**
             * Defines the ID or DOM Reference of the element at which the user menu is shown.
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
             * Fired when the account avatar is selected.
             */
            avatarClick: {
              parameters: {}
            },

            /**
             * Fired when the account is switched to a different one.
             */
            changeAccount: {
              allowPreventDefault: true,
              parameters: {
                /**
                 * The previously selected account.
                 */
                prevSelectedAccount: {
                  type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuAccount",
                  types: [
                    {
                      origType: "UserMenuAccount",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "UserMenuAccount",
                          ui5Type:
                            "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuAccount",
                          moduleType:
                            "module:ui5/webcomponents_fiori/dist/UserMenuAccount",
                          packageName:
                            "sap/f/gen/ui5/webcomponents_fiori/dist/UserMenuAccount",
                          isClass: true
                        }
                      ]
                    }
                  ],
                  dtsParamDescription: "The previously selected account."
                },
                /**
                 * The selected account.
                 */
                selectedAccount: {
                  type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuAccount",
                  types: [
                    {
                      origType: "UserMenuAccount",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "UserMenuAccount",
                          ui5Type:
                            "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuAccount",
                          moduleType:
                            "module:ui5/webcomponents_fiori/dist/UserMenuAccount",
                          packageName:
                            "sap/f/gen/ui5/webcomponents_fiori/dist/UserMenuAccount",
                          isClass: true
                        }
                      ]
                    }
                  ],
                  dtsParamDescription: "The selected account."
                }
              }
            },

            /**
             * Fired when a user menu is close.
             */
            close: {
              parameters: {}
            },

            /**
             * Fired when the "Edit Accounts" button is selected.
             */
            editAccountsClick: {
              parameters: {}
            },

            /**
             * Fired when a menu item is selected.
             */
            itemClick: {
              allowPreventDefault: true,
              parameters: {
                /**
                 * The selected `user menu item`.
                 */
                item: {
                  type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuItem",
                  types: [
                    {
                      origType: "UserMenuItem",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "UserMenuItem",
                          ui5Type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuItem",
                          moduleType:
                            "module:ui5/webcomponents_fiori/dist/UserMenuItem",
                          packageName:
                            "sap/f/gen/ui5/webcomponents_fiori/dist/UserMenuItem",
                          isClass: true
                        }
                      ]
                    }
                  ],
                  dtsParamDescription: "The selected `user menu item`."
                }
              }
            },

            /**
             * Fired when the "Manage Account" button is selected.
             */
            manageAccountClick: {
              parameters: {}
            },

            /**
             * Fired when a user menu is open.
             */
            onOpen: {
              mapping: "open",
              parameters: {}
            },

            /**
             * Fired when the "Sign Out" button is selected.
             */
            signOutClick: {
              allowPreventDefault: true,
              parameters: {}
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return UserMenu;
  }
);
