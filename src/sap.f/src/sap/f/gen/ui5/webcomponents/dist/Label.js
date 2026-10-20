/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ui/core/LabelEnablement",
    "sap/f/gen/ui5/webcomponents",
    "sap/f/thirdparty/Label"
  ],
  function (WebComponent, LabelEnablement) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-label` is a component used to represent a label for elements like input, textarea, select.
     * The `for` property of the `ui5-label` must be the same as the id attribute of the related input element.
     * Screen readers read out the label, when the user focuses the labelled control.
     *
     * The `ui5-label` appearance can be influenced by properties,
     * such as `required` and `wrappingType`.
     * The appearance of the Label can be configured in a limited way by using the design property.
     * For a broader choice of designs, you can use custom styles.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Label";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents/dist/Label
     */

    const Label = WebComponent.extend("sap.f.gen.ui5.webcomponents.dist.Label", {
      metadata: {
        tag: "ui5-label-29d33248",

        namespace: "sap.f.gen.ui5.webcomponents",

        library: "sap.f",

        designtime: "sap/f/gen/ui5/webcomponents/designtime/Label.designtime",

        interfaces: ["sap.ui.core.Label"],

        defaultAggregation: "content",

        properties: {
          /**
           * Defines whether an asterisk character is added to the component text.
           *
           * **Note:** Usually indicates that user input (bound with the `for` property) is required.
           * In that case the `required` property of
           * the corresponding input should also be set.
           */
          required: {
            type: "boolean",
            mapping: "property",
            defaultValue: false
          },
          /**
           * Defines whether colon is added to the component text.
           *
           * **Note:** Usually used in forms.
           */
          showColon: {
            type: "boolean",
            mapping: "property",
            defaultValue: false
          },
          /**
           * Defines how the text of a component will be displayed when there is not enough space.
           *
           * **Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
           * @type module:sap/f/gen/ui5/webcomponents/dist/types/WrappingType
           */
          wrappingType: {
            type: "sap.f.gen.ui5.webcomponents.dist.types.WrappingType",
            mapping: "property",
            defaultValue: "Normal"
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

        aggregations: {},

        associations: {
          labelFor: {
            type: "sap.ui.core.Control",
            multiple: false,
            mapping: { type: "property", to: "for" }
          }
        },

        events: {},

        getters: [],

        methods: []
      }
    });
    LabelEnablement.enrich(Label.prototype);

    return Label;
  }
);
