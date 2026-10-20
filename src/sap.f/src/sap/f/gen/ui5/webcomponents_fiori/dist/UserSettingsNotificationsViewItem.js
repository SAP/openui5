/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/ListItemCustom",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/UserSettingsNotificationsViewItem"
  ],
  function (ListItemCustom) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-notifications-view-item` represents a single notification setting
     * within the `ui5-user-settings-notifications-view`.
     *
     * It displays a title and an optional byline. By default a trailing switch reflects
     * the `checked` state. Applications can override the trailing control by providing content
     * in the `endContent` slot (e.g. a `ui5-select` for a value picker); the built-in switch and
     * its `switch-change` event are then suppressed. Items can additionally be flagged as
     * `navigable` to display a navigation arrow and behave as clickable list rows.
     *
     * **Note:** The default switch and the `endContent` slot are mutually exclusive.
     * When any content is provided in `endContent`, the trailing switch is not rendered
     * and no `switch-change` event is fired.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserSettingsNotificationsViewItem.js";`
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/ListItemCustom
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsNotificationsViewItem
     */

    const UserSettingsNotificationsViewItem = ListItemCustom.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsNotificationsViewItem",
      {
        metadata: {
          tag: "ui5-user-settings-notifications-view-item-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/UserSettingsNotificationsViewItem.designtime",

          interfaces: [],

          defaultAggregation: "content",

          properties: {
            /**
             * Defines the byline text of the item, rendered below the title.
             */
            bylineText: {
              type: "string",
              mapping: "property",
              defaultValue: ""
            },
            /**
             * Defines whether the trailing switch is on.
             *
             * Ignored when the `endContent` slot is used.
             */
            checked: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the unique identifier of the item.
             *
             * When the item is navigable, `itemKey` is also used to route to a matching sibling
             * `secondary` view by id.
             */
            itemKey: { type: "string", mapping: "property", defaultValue: "" },
            /**
             * Defines whether the item is navigable. When true, a navigation arrow is rendered
             * and the whole row becomes clickable (fires the parent view's `item-click` event).
             */
            navigable: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the title text of the item.
             */
            text: { type: "string", mapping: "property", defaultValue: "" },
            /**
             * Defines the additional accessibility attributes that will be applied to the component.
             * The following fields are supported:
             *
             * - **ariaSetsize**: Defines the number of items in the current set  when not all items in the set are present in the DOM.
             * **Note:** The value is an integer reflecting the number of items in the complete set. If the size of the entire set is unknown, set `-1`.
             *
             * 	- **ariaPosinset**: Defines an element's number or position in the current set when not all items are present in the DOM.
             * 	**Note:** The value is an integer greater than or equal to 1, and less than or equal to the size of the set when that size is known.
             */
            accessibilityAttributes: {
              type: "any",
              mapping: "property",
              defaultValue: {}
            },
            /**
             * Defines the text alternative of the component.
             *
             * **Note**: If not provided a default text alternative will be set, if present.
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
             * Defines whether the item is movable.
             */
            movable: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
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
             * Defines custom content rendered at the trailing end of the item, replacing the
             * default switch. Use this to place a `ui5-select`, `ui5-input`, or any other
             * control instead of a boolean toggle.
             * @type module:sap/ui/core/Control
             */
            endContent: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "endContent"
            },
            /**
             * Defines the content of the component.
             * @type module:sap/ui/core/Control
             */
            content: { type: "sap.ui.core.Control", multiple: true },
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
            }
          },

          associations: {},

          events: {
            /**
             * Fired when the switch state changes.
             *
             * Not fired when the `endContent` slot is used to override the trailing control.
             */
            switchChange: {
              enableEventBubbling: true,
              parameters: {
                /**
                 * The new checked state of the switch.
                 */
                checked: {
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
                  dtsParamDescription: "The new checked state of the switch."
                },
                /**
                 * The item whose switch was toggled.
                 */
                item: {
                  type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsNotificationsViewItem",
                  types: [
                    {
                      origType: "UserSettingsNotificationsViewItem",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "UserSettingsNotificationsViewItem",
                          ui5Type:
                            "sap.f.gen.ui5.webcomponents_fiori.dist.UserSettingsNotificationsViewItem",
                          moduleType:
                            "module:ui5/webcomponents_fiori/dist/UserSettingsNotificationsViewItem",
                          packageName:
                            "sap/f/gen/ui5/webcomponents_fiori/dist/UserSettingsNotificationsViewItem",
                          isClass: true
                        }
                      ]
                    }
                  ],
                  dtsParamDescription: "The item whose switch was toggled."
                }
              }
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
             * Fired when the user clicks on the detail button when type is `Detail`.
             */
            detailClick: {
              enableEventBubbling: true,
              parameters: {}
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return UserSettingsNotificationsViewItem;
  }
);
