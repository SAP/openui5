/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/ListItem",
    "sap/f/gen/ui5/webcomponents",
    "sap/f/thirdparty/UserSettingsAppearanceViewItem"
  ],
  function (ListItem) {
    "use strict";

    /**
     * @class
     * A component to be used as custom list item within the `ui5-list`
     * the same way as the standard `ui5-li`.
     *
     * The component accepts arbitrary HTML content to allow full customization.
     *
     * ### Keyboard Handling
     *
     * Interactive elements placed in the default slot (buttons, links, inputs, etc.)
     * are **not** reached by [Tab] from outside the list. This follows the SAP Fiori
     * "Intentional Edit Pattern" and preserves fast keyboard navigation between items.
     *
     * To activate an interactive element inside a `ui5-li-custom`:
     *
     * - [F2] on the focused item - moves focus to the first interactive element inside the item.
     *   Pressing [F2] again returns focus to the item level.
     * - [F7] on the focused item - moves focus to the last remembered interactive element
     *   inside the item (or to the first interactive element if none is remembered).
     *   Pressing [F7] again saves the current position and returns focus to the item level.
     * - [Tab] or [Shift] + [Tab] then walks through the interactive elements within the item
     *   and continues into the next/previous item.
     * - [Up] or [Down] while focused on an interactive element moves focus to the element
     *   at the same index in the previous/next item; items with no interactive elements
     *   are skipped and `ui5-li-group` boundaries are crossed.
     *
     * See the `ui5-list` "Keyboard Handling" section for the full behavior.
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/ListItem
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents/dist/ListItemCustom
     */

    const ListItemCustom = ListItem.extend(
      "sap.f.gen.ui5.webcomponents.dist.ListItemCustom",
      {
        metadata: {
          tag: "ui5-li-custom-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents",

          library: "sap.f",

          designtime: "sap/f/gen/ui5/webcomponents/designtime/ListItemCustom.designtime",

          interfaces: [],

          defaultAggregation: "content",

          properties: {
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

    return ListItemCustom;
  }
);
