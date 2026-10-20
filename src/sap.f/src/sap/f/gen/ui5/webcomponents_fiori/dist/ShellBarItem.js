/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/ShellBarItem"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * The `ui5-shellbar-item` represents a custom item for `ui5-shellbar`.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/ShellBarItem.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBarItem
     */

    const ShellBarItem = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.ShellBarItem",
      {
        metadata: {
          tag: "ui5-shellbar-item-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/ShellBarItem.designtime",

          interfaces: ["sap.m.IBar"],

          defaultAggregation: "",

          properties: {
            /**
             * Defines additional accessibility attributes on Shellbar Items.
             *
             * The accessibility attributes support the following values:
             *
             * - **expanded**: Indicates whether the button, or another grouping element it controls,
             * is currently expanded or collapsed.
             * Accepts the following string values: `true` or `false`.
             *
             * - **hasPopup**: Indicates the availability and type of interactive popup element,
             * such as menu or dialog, that can be triggered by the button.
             *
             * - **controls**: Identifies the element (or elements) whose contents
             * or presence are controlled by the component.
             * Accepts a lowercase string value, referencing the ID of the element it controls.
             */
            accessibilityAttributes: {
              type: "any",
              mapping: "property",
              defaultValue: {}
            },
            /**
             * Defines the count displayed in badge.
             */
            count: { type: "string", mapping: "property" },
            /**
             * Defines the item's icon.
             */
            icon: { type: "string", mapping: "property" },
            /**
             * Defines the item text.
             *
             * **Note:** The text is only displayed inside the overflow popover list view.
             */
            text: { type: "string", mapping: "property" },
            /**
             * The 'width' of the Web Component in <code>sap.ui.core.CSSSize</code>.
             */
            width: { type: "sap.ui.core.CSSSize", mapping: "style" },
            /**
             * The 'height' of the Web Component in <code>sap.ui.core.CSSSize</code>.
             */
            height: { type: "sap.ui.core.CSSSize", mapping: "style" }
          },

          aggregations: {},

          associations: {},

          events: {
            /**
             * Fired when the item is clicked.
             */
            click: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                /**
                 * DOM ref of the clicked element
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
                  dtsParamDescription: "DOM ref of the clicked element"
                }
              }
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return ShellBarItem;
  }
);
