/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ui/core/EnabledPropagator",
    "sap/f/gen/ui5/webcomponents",
    "sap/f/thirdparty/Button"
  ],
  function (WebComponent, EnabledPropagator) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-button` component represents a simple push button.
     * It enables users to trigger actions by clicking or tapping the `ui5-button`, or by pressing
     * certain keyboard keys, such as Enter.
     *
     * ### Usage
     *
     * For the `ui5-button` UI, you can define text, icon, or both. You can also specify
     * whether the text or the icon is displayed first.
     *
     * You can choose from a set of predefined types that offer different
     * styling to correspond to the triggered action.
     *
     * You can set the `ui5-button` as enabled or disabled. An enabled
     * `ui5-button` can be pressed by clicking or tapping it. The button changes
     * its style to provide visual feedback to the user that it is pressed or hovered over with
     * the mouse cursor. A disabled `ui5-button` appears inactive and cannot be pressed.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Button.js";`
     *
     * @implements module:sap/f/gen/ui5/webcomponents/dist/Button.IButton
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents/dist/Button
     */

    const Button = WebComponent.extend("sap.f.gen.ui5.webcomponents.dist.Button", {
      metadata: {
        tag: "ui5-button-29d33248",

        namespace: "sap.f.gen.ui5.webcomponents",

        library: "sap.f",

        designtime: "sap/f/gen/ui5/webcomponents/designtime/Button.designtime",

        interfaces: ["sap.f.gen.ui5.webcomponents.dist.Button.IButton"],

        defaultAggregation: "",

        properties: {
          /**
           * Defines the additional accessibility attributes that will be applied to the component.
           * The following fields are supported:
           *
           * - **expanded**: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed.
           * Accepts the following string values: `true` or `false`
           *
           * - **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.
           * Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.
           *
           * - **ariaLabel**: Defines the accessible ARIA name of the component.
           * Accepts any string value.
           *
           *  - **ariaKeyShortcuts**: Defines keyboard shortcuts that activate or give focus to the button.
           *
           * - **controls**: Identifies the element (or elements) whose contents or presence are controlled by the button element.
           * Accepts a lowercase string value.
           */
          accessibilityAttributes: {
            type: "any",
            mapping: "property",
            defaultValue: {}
          },
          /**
           * Defines the accessible description of the component.
           */
          accessibleDescription: { type: "string", mapping: "property" },
          /**
           * Defines the accessible ARIA name of the component.
           */
          accessibleName: { type: "string", mapping: "property" },
          /**
           * Describes the accessibility role of the button.
           *
           * **Note:** Use <code>ButtonAccessibleRole.Link</code> role only with a press handler, which performs a navigation. In all other scenarios the default button semantics are recommended.
           * @type module:sap/f/gen/ui5/webcomponents/dist/types/ButtonAccessibleRole
           */
          accessibleRole: {
            type: "sap.f.gen.ui5.webcomponents.dist.types.ButtonAccessibleRole",
            mapping: "property",
            defaultValue: "Button"
          },
          /**
           * Defines the component design.
           * @type module:sap/f/gen/ui5/webcomponents/dist/types/ButtonDesign
           */
          design: {
            type: "sap.f.gen.ui5.webcomponents.dist.types.ButtonDesign",
            mapping: "property",
            defaultValue: "Default"
          },
          /**
           * Defines whether the component is disabled.
           * A disabled component can't be pressed or
           * focused, and it is not in the tab chain.
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
           * Defines the icon, displayed as graphical element within the component after the button text.
           *
           * **Note:** It is highly recommended to use `endIcon` property only together with `icon` and/or `text` properties.
           * Usage of `endIcon` only should be avoided.
           *
           * The SAP-icons font provides numerous options.
           *
           * Example:
           * See all the available icons within the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html).
           */
          endIcon: { type: "string", mapping: "property" },
          /**
           * Associates the button with a form element by the form's `id` attribute.
           * When set, the button can submit or reset the specified form even if the button
           * is not a descendant of that form.
           *
           * **Note:** This property takes effect only when the button's "type" property is set to "Submit" or "Reset".
           */
          form: { type: "string", mapping: "property" },
          /**
           * Defines the icon, displayed as graphical element within the component.
           * The SAP-icons font provides numerous options.
           *
           * Example:
           * See all the available icons within the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html).
           */
          icon: { type: "string", mapping: "property" },
          /**
           * Defines whether the button shows a loading indicator.
           *
           * **Note:** If set to `true`, a busy indicator component will be displayed on the related button.
           */
          loading: {
            type: "boolean",
            mapping: "property",
            defaultValue: false
          },
          /**
           * Specifies the delay in milliseconds before the loading indicator appears within the associated button.
           */
          loadingDelay: {
            type: "float",
            mapping: "property",
            defaultValue: 1000
          },
          /**
           * When set to `true`, the component will
           * automatically submit the nearest HTML form element on `press`.
           *
           * **Note:** This property is only applicable within the context of an HTML Form element.`
           */
          submits: {
            type: "boolean",
            mapping: "property",
            defaultValue: false
          },
          /**
           * Defines whether the button has special form-related functionality.
           *
           * **Note:** This property is only applicable within the context of an HTML Form element.
           * @type module:sap/f/gen/ui5/webcomponents/dist/types/ButtonType
           */
          type: {
            type: "sap.f.gen.ui5.webcomponents.dist.types.ButtonType",
            mapping: "property",
            defaultValue: "Button"
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
           * Adds a badge to the button.
           * @type module:sap/f/gen/ui5/webcomponents/dist/ButtonBadge
           */
          badge: {
            type: "sap.f.gen.ui5.webcomponents.dist.ButtonBadge",
            multiple: true,
            slot: "badge"
          }
        },

        associations: {
          /**
           * Receives id(or many ids) of the elements that label the component.
           */
          ariaLabelledBy: {
            type: "sap.ui.core.Control",
            multiple: true,
            mapping: {
              type: "property",
              to: "accessibleNameRef",
              formatter: "_getAriaLabelledByForRendering"
            }
          }
        },

        events: {
          /**
           * Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.
           *
           * **Note:** The event will not be fired if the `disabled` property is set to `true`.
           */
          click: {
            allowPreventDefault: true,
            enableEventBubbling: true,
            parameters: {
              /**
               * Returns whether the "ALT" key was pressed when the event was triggered.
               */
              altKey: {
                type: "boolean",
                types: [
                  {
                    origType: "boolean",
                    multiple: false,
                    dedicatedTypes: [{ dtsType: "boolean", ui5Type: "boolean" }]
                  }
                ],
                dtsParamDescription:
                  'Returns whether the "ALT" key was pressed when the event was triggered.'
              },
              /**
               * Returns whether the "CTRL" key was pressed when the event was triggered.
               */
              ctrlKey: {
                type: "boolean",
                types: [
                  {
                    origType: "boolean",
                    multiple: false,
                    dedicatedTypes: [{ dtsType: "boolean", ui5Type: "boolean" }]
                  }
                ],
                dtsParamDescription:
                  'Returns whether the "CTRL" key was pressed when the event was triggered.'
              },
              /**
               * Returns whether the "META" key was pressed when the event was triggered.
               */
              metaKey: {
                type: "boolean",
                types: [
                  {
                    origType: "boolean",
                    multiple: false,
                    dedicatedTypes: [{ dtsType: "boolean", ui5Type: "boolean" }]
                  }
                ],
                dtsParamDescription:
                  'Returns whether the "META" key was pressed when the event was triggered.'
              },
              /**
               * Returns original event that comes from user's **click** interaction
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
                  "Returns original event that comes from user's **click** interaction"
              },
              /**
               * Returns whether the "SHIFT" key was pressed when the event was triggered.
               */
              shiftKey: {
                type: "boolean",
                types: [
                  {
                    origType: "boolean",
                    multiple: false,
                    dedicatedTypes: [{ dtsType: "boolean", ui5Type: "boolean" }]
                  }
                ],
                dtsParamDescription:
                  'Returns whether the "SHIFT" key was pressed when the event was triggered.'
              }
            }
          }
        },

        getters: [],

        methods: []
      }
    });

    EnabledPropagator.call(Button.prototype);

    return Button;
  }
);
