/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/IllustratedMessage"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     * An IllustratedMessage is a recommended combination of a solution-oriented message, an engaging
     * illustration, and conversational tone to better communicate an empty or a success state than just show
     * a message alone.
     *
     * Each illustration has default internationalised title and subtitle texts. Also they can be managed with
     * `titleText` and `subtitleText` properties.
     *
     * To display the desired illustration, use the `name` property, where you can find the list of all available illustrations.
     *
     * **Note:** By default the “BeforeSearch” illustration is loaded. To use other illustrations, make sure you import them in addition, for example:
     *
     * `import "@ui5/webcomponents-fiori/dist/illustrations/NoData.js"`
     *
     * **Note:** Illustrations starting with the “Tnt” prefix are part of another illustration set. For example to use the “TntSuccess” illustration, add the following import::
     *
     * `import "@ui5/webcomponents-fiori/dist/illustrations/tnt/Success.js"`
     *
     * ### Structure
     * The IllustratedMessage consists of the following elements, which are displayed below each other in the following order:
     *
     * - Illustration
     * - Title
     * - Subtitle
     * - Actions
     *
     * ### Usage
     * `ui5-illustrated-message` is meant to be used inside container component, for example a `ui5-card`,
     * a `ui5-dialog` or a `ui5-page`
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/IllustratedMessage.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/IllustratedMessage
     */

    const IllustratedMessage = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.IllustratedMessage",
      {
        metadata: {
          tag: "ui5-illustrated-message-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/IllustratedMessage.designtime",

          interfaces: [],

          defaultAggregation: "actions",

          properties: {
            /**
             * Defines whether the illustration is decorative.
             *
             * When set to `true`, the attributes `role="presentation"` and `aria-hidden="true"` are applied to the SVG element.
             */
            decorative: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Determines which illustration breakpoint variant is used.
             *
             * As `IllustratedMessage` adapts itself around the `Illustration`, the other
             * elements of the component are displayed differently on the different breakpoints/illustration designs.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/types/IllustrationMessageDesign
             */
            design: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.types.IllustrationMessageDesign",
              mapping: "property",
              defaultValue: "Auto"
            },
            /**
             * Defines the illustration name that will be displayed in the component.
             *
             * Example:
             *
             * `name='BeforeSearch'`, `name='UnableToUpload'`, etc..
             *
             * **Note:** To use the TNT illustrations,
             * you need to set the `tnt` or `Tnt` prefix in front of the icon's name.
             *
             * Example:
             *
             * `name='tnt/Avatar'` or `name='TntAvatar'`.
             *
             * **Note:** By default the `BeforeSearch` illustration is loaded.
             * When using an illustration type, other than the default, it should be loaded in addition:
             *
             * `import "sap/f/gen/ui5/webcomponents_fiori/dist/illustrations/NoData.js";`
             *
             * For TNT illustrations:
             *
             * `import "sap/f/gen/ui5/webcomponents_fiori/dist/illustrations/tnt/SessionExpired.js";`
             */
            name: {
              type: "string",
              mapping: "property",
              defaultValue: "BeforeSearch"
            },
            /**
             * Defines the subtitle of the component.
             *
             * **Note:** Using this property, the default subtitle text of illustration will be overwritten.
             *
             * **Note:** Using `subtitle` slot, the default of this property will be overwritten.
             */
            subtitleText: { type: "string", mapping: "property" },
            /**
             * Defines the title of the component.
             *
             * **Note:** Using this property, the default title text of illustration will be overwritten.
             */
            titleText: { type: "string", mapping: "property" },
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
             * Defines the component actions.
             *
             * **Note:** Not displayed when the `design` property is set to `Base`.
             * @type sap/f/gen/ui5/webcomponents/dist/Button
             */
            actions: {
              type: "sap.f.gen.ui5.webcomponents.dist.Button.IButton",
              multiple: true
            },
            /**
             * Defines the subtitle of the component.
             *
             * **Note:** Using this slot, the default subtitle text of illustration and the value of `subtitleText` property will be overwritten.
             * @type module:sap/ui/core/Control
             */
            subtitle: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "subtitle"
            },
            /**
             * Defines the title of the component.
             *
             * **Note:** Using this slot, the default title text of illustration and the value of `title` property will be overwritten.
             * @type module:sap/ui/core/Control
             */
            title: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "title"
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

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return IllustratedMessage;
  }
);
