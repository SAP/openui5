/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/ShellBarBranding"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     * The `ui5-shellbar-branding` component is intended to be placed inside the branding slot of the
     * `ui5-shellbar` component. Its content has higher priority than the `primaryTitle` property
     * and the `logo` slot of `ui5-shellbar`.
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBarBranding
     */

    const ShellBarBranding = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.ShellBarBranding",
      {
        metadata: {
          tag: "ui5-shellbar-branding-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/ShellBarBranding.designtime",

          interfaces: ["sap.m.IBar"],

          defaultAggregation: "content",

          properties: {
            /**
             * Defines the text alternative of the component.
             * If not provided a default text alternative will be set, if present.
             */
            accessibleName: { type: "string", mapping: "property" },
            /**
             * Defines the component href.
             *
             * **Note:** Standard hyperlink behavior is supported.
             */
            href: { type: "string", mapping: "property" },
            /**
             * Defines the component target.
             *
             * **Notes:**
             *
             * - `_self`
             * - `_top`
             * - `_blank`
             * - `_parent`
             * - `_search`
             *
             * **This property must only be used when the `href` property is set.**
             */
            target: { type: "string", mapping: "property" },
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
             * Defines the title for the ui5-shellbar-branding component.
             *
             * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
             * @type module:sap/ui/core/Control
             */
            content: { type: "sap.ui.core.Control", multiple: true },
            /**
             * Defines the logo of the `ui5-shellbar`.
             * For example, you can use `ui5-avatar` or `img` elements as logo.
             * @type module:sap/ui/core/Control
             */
            logo: { type: "sap.ui.core.Control", multiple: true, slot: "logo" }
          },

          associations: {},

          events: {
            /**
             * Fired, when the logo is activated.
             */
            click: {
              enableEventBubbling: true,
              parameters: {}
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return ShellBarBranding;
  }
);
