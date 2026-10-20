/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/HeroBanner"
  ],
  function (WebComponent) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-hero-banner` is a flexible, full-width banner designed for placement at the top of a page.
     * It provides a personalized greeting and quick access to key information or actions.
     *
     * ### Structure
     *
     * The HeroBanner consists of the following building blocks:
     *
     * - **Banner Canvas** - the visual base with a background color, optional background image and shadow.
     * - **Overline** (optional) - contextual text at the top, e.g. the current date or a status message.
     * - **Header** (optional) - the main greeting header below the overline, e.g. "Hello, John".
     * - **Free Slots** (optional) - customizable content areas that can contain KPI cards, search components, text, buttons, etc.
     *
     * The banner is not sticky — it scrolls away with the page content when the user scrolls down.
     *
     * ### Usage
     *
     * Place the `ui5-hero-banner` at the top of a page to welcome the user and surface relevant
     * information or shortcuts at a glance.
     *
     * The hero banner itself is non-interactive. However, interactive elements such as buttons, cards,
     * or search fields can be placed inside the free content slots and will follow their own
     * interactive states.
     *
     * ### Responsive Behavior
     *
     * The hero banner adapts to different screen sizes:
     * - On smaller screens, split layouts (Equal, FirstWider) collapse to a single stacked column.
     * - The heading text wraps to multiple lines as needed.
     * - Buttons in the headerAction slot will wrap.
     * - On screens ≤1024px, the header text is wrapped to a maximum of 3 lines.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/HeroBanner.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/HeroBanner
     */

    const HeroBanner = WebComponent.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.HeroBanner",
      {
        metadata: {
          tag: "ui5-hero-banner-29d33248",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/HeroBanner.designtime",

          interfaces: [],

          defaultAggregation: "startContent",

          properties: {
            /**
             * Defines the placement of the actions slot within the hero banner header.
             *
             * - **TopEnd** (default) - Actions are displayed to the right of the header text, at the top of the header row.
             * - **BottomStart** - Actions are displayed below the header text, left-aligned, regardless of `columnsRatio` or slot usage.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/types/HeroBannerActionsPlacement
             */
            actionsPlacement: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.types.HeroBannerActionsPlacement",
              mapping: "property",
              defaultValue: "TopEnd"
            },
            /**
             * Defines the ratio between the two content columns inside the hero banner.
             *
             * Takes effect only when `endContent` is provided. When no `endContent` is present, the content spans the full width (single column).
             *
             * - **Equal** - Two equal columns. Both content blocks share the available width equally.
             *   On smaller screens, both slots stack vertically.
             * - **FirstWider** - Two unequal columns. The start content takes two-thirds of the width, the end content one-third.
             *   On smaller screens, both slots stack vertically.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/types/HeroBannerColumnsRatio
             */
            columnsRatio: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.types.HeroBannerColumnsRatio",
              mapping: "property",
              defaultValue: "FirstWider"
            },
            /**
             * Defines the vertical placement of the header block within the content area.
             *
             * - **Top** (default) - Header block is placed at the top of the content area.
             * - **Bottom** - Header block is pushed to the bottom of column 1. Only takes effect when `columnsRatio`
             *   is `Equal` or `FirstWider` and only `endContent` is provided (no default slot content).
             *   When `actionsPlacement` is also `BottomStart`, the `endContent` slot spans the full height.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/types/HeroBannerHeaderBlockPlacement
             */
            headerBlockPlacement: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.types.HeroBannerHeaderBlockPlacement",
              mapping: "property",
              defaultValue: "Top"
            },
            /**
             * Defines the header text displayed in the hero banner.
             *
             * This is the main greeting header, typically a personalized message
             * such as "Hello, John".
             */
            headerText: { type: "string", mapping: "property" },
            /**
             * Defines text displayed above the heading as an overline.
             * Can be used to show the current date, a status message, or any other relevant contextual information.
             */
            overlineText: { type: "string", mapping: "property" },
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
             * Defines action buttons displayed to the right of the header area.
             * Typically used to display actions buttons in the top right corner.
             *
             * Can contain buttons, links, or other interactive elements that provide
             * quick access to relevant actions directly from the hero banner header.
             * @type module:sap/ui/core/Control
             */
            actions: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "actions"
            },
            /**
             * Defines the first (default) free content block of the hero banner.
             *
             * This is the default slot — content placed directly inside `<ui5-hero-banner>`
             * without a slot attribute lands here.
             * Can contain KPI cards, search input fields, text, buttons, and more.
             * @type module:sap/ui/core/Control
             */
            startContent: { type: "sap.ui.core.Control", multiple: true },
            /**
             * Defines the second free content block of the hero banner.
             *
             * Used alongside `startContent` when `columnsRatio` is set (`Equal`, `FirstWider`).
             * Can contain cards, buttons, and other interactive elements.
             * @type module:sap/ui/core/Control
             */
            endContent: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "endContent"
            }
          },

          associations: {},

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return HeroBanner;
  }
);
