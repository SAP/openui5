/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/ListItemGroupBase",
    "sap/f/gen/ui5/webcomponents",
    "sap/f/thirdparty/UserSettingsAppearanceViewGroup"
  ],
  function (ListItemGroupBase) {
    "use strict";

    /**
     * @class
     * ### Overview
     * The `ui5-li-group` is a special list item, used only to create groups of list items.
     *
     * This is the item to use inside a `ui5-list`.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents/dist/ListItemGroup.js";`
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/ListItemGroupBase
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents/dist/ListItemGroup
     */

    const ListItemGroup = ListItemGroupBase.extend(
      "sap.f.gen.ui5.webcomponents.dist.ListItemGroup",
      {
        metadata: {
          tag: "ui5-li-group-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents",

          library: "sap.f",

          designtime: "sap/f/gen/ui5/webcomponents/designtime/ListItemGroup.designtime",

          interfaces: [],

          defaultAggregation: "items",

          properties: {
            /**
             * Defines the accessible name of the header.
             */
            headerAccessibleName: { type: "string", mapping: "property" },
            /**
             * Defines the header text of the group.
             */
            headerText: { type: "string", mapping: "property" },
            /**
             * Defines if the text of the component should wrap when it's too long.
             * When set to "Normal", the content (title, description) will be wrapped
             * using the `ui5-expandable-text` component.<br/>
             *
             * The text can wrap up to 100 characters on small screens (size S) and
             * up to 300 characters on larger screens (size M and above). When text exceeds
             * these limits, it truncates with an ellipsis followed by a text expansion trigger.
             *
             * Available options are:
             * - `None` (default) - The text will truncate with an ellipsis.
             * - `Normal` - The text will wrap (without truncation).
             * @type module:sap/f/gen/ui5/webcomponents/dist/types/WrappingType
             */
            wrappingType: {
              type: "sap.f.gen.ui5.webcomponents.dist.types.WrappingType",
              mapping: "property",
              defaultValue: "None"
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
             * Defines the items of the group.
             * @type module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
             */
            items: {
              type: "sap.f.gen.ui5.webcomponents.dist.ListItemBase",
              multiple: true
            },
            /**
             * Defines the header of the component.
             *
             * **Note:** Using this slot, the default header text of group and the value of `headerText` property will be overwritten.
             * @type module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
             */
            header: {
              type: "sap.f.gen.ui5.webcomponents.dist.ListItemBase",
              multiple: true,
              slot: "header"
            }
          },

          associations: {},

          events: {
            /**
             * Fired when a movable list item is dropped onto a drop target.
             *
             * **Note:** `move` event is fired only if there was a preceding `move-over` with prevented default action.
             */
            move: {
              enableEventBubbling: true,
              parameters: {
                /**
                 * Contains information about the destination of the moved element. Has `element` and `placement` properties.
                 */
                destination: {
                  type: "object",
                  types: [
                    {
                      origType: "object",
                      multiple: false,
                      dedicatedTypes: [{ dtsType: "object", ui5Type: "object" }]
                    }
                  ],
                  dtsParamDescription:
                    "Contains information about the destination of the moved element. Has `element` and `placement` properties."
                },
                /**
                 * Contains information about the moved element under `element` property.
                 */
                source: {
                  type: "object",
                  types: [
                    {
                      origType: "object",
                      multiple: false,
                      dedicatedTypes: [{ dtsType: "object", ui5Type: "object" }]
                    }
                  ],
                  dtsParamDescription:
                    "Contains information about the moved element under `element` property."
                }
              }
            },

            /**
             * Fired when a movable list item is moved over a potential drop target during a dragging operation.
             *
             * If the new position is valid, prevent the default action of the event using `preventDefault()`.
             */
            moveOver: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                /**
                 * Contains information about the destination of the moved element. Has `element` and `placement` properties.
                 */
                destination: {
                  type: "object",
                  types: [
                    {
                      origType: "object",
                      multiple: false,
                      dedicatedTypes: [{ dtsType: "object", ui5Type: "object" }]
                    }
                  ],
                  dtsParamDescription:
                    "Contains information about the destination of the moved element. Has `element` and `placement` properties."
                },
                /**
                 * Contains information about the moved element under `element` property.
                 */
                source: {
                  type: "object",
                  types: [
                    {
                      origType: "object",
                      multiple: false,
                      dedicatedTypes: [{ dtsType: "object", ui5Type: "object" }]
                    }
                  ],
                  dtsParamDescription:
                    "Contains information about the moved element under `element` property."
                }
              }
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return ListItemGroup;
  }
);
