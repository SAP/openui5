/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/ListItemBase",
    "sap/f/gen/ui5/webcomponents",
    "sap/f/thirdparty/UserMenuItem"
  ],
  function (ListItemBase) {
    "use strict";

    /**
     * @class
     * A class to serve as a base
     * for the `ListItemStandard` and `ListItemCustom` classes.
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents/dist/ListItem
     */

    const ListItem = ListItemBase.extend("sap.f.gen.ui5.webcomponents.dist.ListItem", {
      metadata: {
        tag: "",

        namespace: "sap.f.gen.ui5.webcomponents",

        library: "sap.f",

        designtime: "sap/f/gen/ui5/webcomponents/designtime/ListItem.designtime",

        interfaces: [],

        defaultAggregation: "",

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
           * The text-content of the Web Component.
           */
          text: { type: "string", mapping: "textContent" }
        },

        aggregations: {
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
    });

    return ListItem;
  }
);
