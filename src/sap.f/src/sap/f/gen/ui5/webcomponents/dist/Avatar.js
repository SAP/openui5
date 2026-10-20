/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ui/core/EnabledPropagator",
    "sap/f/gen/ui5/webcomponents",
    "sap/f/thirdparty/Avatar"
  ],
  function (WebComponent, EnabledPropagator) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * An image-like component that has different display options for representing images and icons
     * in different shapes and sizes, depending on the use case.
     *
     * The shape can be circular or square. There are several predefined sizes, as well as an option to
     * set a custom size.
     *
     * ### Keyboard Handling
     *
     * - [Space] / [Enter] or [Return] - Fires the `click` event if the `mode` is set to `Interactive` or the deprecated `interactive` property is set to true.
     * - [Shift] - If [Space] is pressed, pressing [Shift] releases the component without triggering the click event.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents/dist/Avatar.js";`
     *
     * @implements module:sap/f/gen/ui5/webcomponents/dist/AvatarGroup.IAvatarGroupItem
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents/dist/Avatar
     */

    const Avatar = WebComponent.extend("sap.f.gen.ui5.webcomponents.dist.Avatar", {
      metadata: {
        tag: "ui5-avatar-29d33248",

        namespace: "sap.f.gen.ui5.webcomponents",

        library: "sap.f",

        designtime: "sap/f/gen/ui5/webcomponents/designtime/Avatar.designtime",

        interfaces: ["sap.f.gen.ui5.webcomponents.dist.AvatarGroup.IAvatarGroupItem"],

        defaultAggregation: "image",

        properties: {
          /**
           * Defines the additional accessibility attributes that will be applied to the component.
           * The following field is supported:
           *
           * - **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.
           * Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.
           */
          accessibilityAttributes: {
            type: "any",
            mapping: "property",
            defaultValue: {}
          },
          /**
           * Defines the text alternative of the component.
           * If not provided a default text alternative will be set, if present.
           */
          accessibleName: { type: "string", mapping: "property" },
          /**
           * Defines the background color of the desired image.
           * If `colorScheme` is set to `Auto`, the avatar will be displayed with the `Accent6` color.
           * @type module:sap/f/gen/ui5/webcomponents/dist/types/AvatarColorScheme
           */
          colorScheme: {
            type: "sap.f.gen.ui5.webcomponents.dist.types.AvatarColorScheme",
            mapping: "property",
            defaultValue: "Auto"
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
           * Defines the name of the fallback icon, which should be displayed in the following cases:
           *
           * 	- If the initials are not valid (more than 3 letters, unsupported languages or empty initials).
           * 	- If there are three initials and they do not fit in the shape (e.g. WWW for some of the sizes).
           * 	- If the image src is wrong.
           *
           * **Note:** If not set, a default fallback icon "employee" is displayed.
           *
           * **Note:** You should import the desired icon first, then use its name as "fallback-icon".
           *
           * `import "sap/f/gen/ui5/webcomponents-icons/dist/{icon_name}.js"`
           *
           * `<ui5-avatar fallback-icon="alert">`
           *
           * See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html).
           */
          fallbackIcon: {
            type: "string",
            mapping: "property",
            defaultValue: "employee"
          },
          /**
           * Defines the name of the UI5 Icon, that will be displayed.
           *
           * **Note:** If `image` slot is provided, the property will be ignored.
           *
           * **Note:** You should import the desired icon first, then use its name as "icon".
           *
           * `import "sap/f/gen/ui5/webcomponents-icons/dist/{icon_name}.js"`
           *
           * `<ui5-avatar icon="employee">`
           *
           * **Note:** If no icon or an empty one is provided, by default the "employee" icon should be displayed.
           *
           * See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html).
           */
          icon: { type: "string", mapping: "property" },
          /**
           * Defines the displayed initials.
           *
           * Up to three Latin letters can be displayed as initials.
           */
          initials: { type: "string", mapping: "property" },
          /**
           * Defines if the avatar is interactive (focusable and pressable).
           *
           * **Note:** When set to `true`, this property takes precedence over the `mode` property,
           * and the avatar will be rendered as interactive (role="button", focusable) regardless of the `mode` value.
           *
           * **Note:** This property won't have effect if the `disabled`
           * property is set to `true`.
           */
          interactive: {
            type: "boolean",
            mapping: "property",
            defaultValue: false
          },
          /**
           * Defines the mode of the component.
           *
           * **Note:**
           * - `Image` (default) - renders with role="img"
           * - `Decorative` - renders with role="presentation" and aria-hidden="true", making it purely decorative
           * - `Interactive` - renders with role="button", focusable (tabindex="0"), and supports keyboard interaction
           *
           * **Note:** This property is ignored when the `interactive` property is set to `true`.
           * In that case, the avatar will always be rendered as interactive.
           * @type module:sap/f/gen/ui5/webcomponents/dist/types/AvatarMode
           */
          mode: {
            type: "sap.f.gen.ui5.webcomponents.dist.types.AvatarMode",
            mapping: "property",
            defaultValue: "Image"
          },
          /**
           * Defines the shape of the component.
           * @type module:sap/f/gen/ui5/webcomponents/dist/types/AvatarShape
           */
          shape: {
            type: "sap.f.gen.ui5.webcomponents.dist.types.AvatarShape",
            mapping: "property",
            defaultValue: "Circle"
          },
          /**
           * Defines predefined size of the component.
           * @type module:sap/f/gen/ui5/webcomponents/dist/types/AvatarSize
           */
          size: {
            type: "sap.f.gen.ui5.webcomponents.dist.types.AvatarSize",
            mapping: "property",
            defaultValue: "S"
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
           * Defines the optional badge that will be used for visual affordance.
           *
           * **Recommendation:** While badges are supported on all avatars, it is recommended
           * to use them with interactive avatars (via `mode="Interactive"` or `interactive` attribute)
           * to provide better user experience and accessibility.
           *
           * **Note:** While the slot allows for custom badges, to achieve
           * the Fiori design, use the `ui5-avatar-badge` component.
           * @type module:sap/ui/core/Control
           */
          badge: { type: "sap.ui.core.Control", multiple: true, slot: "badge" },
          /**
           * Receives the desired `<img>` tag
           *
           * **Note:** If you experience flickering of the provided image, you can hide the component until it is defined with the following CSS:<br/>
           * `ui5-avatar:not(:defined) {`<br/>
           * &nbsp;&nbsp;&nbsp;&nbsp;`visibility: hidden;`<br/>
           * `}`
           * @type module:sap/ui/core/Control
           */
          image: { type: "sap.ui.core.Control", multiple: true }
        },

        associations: {},

        events: {
          /**
           * Fired on mouseup, space and enter if avatar is interactive
           *
           * **Note:** The event will not be fired if the `disabled`
           * property is set to `true`.
           */
          click: {
            enableEventBubbling: true,
            parameters: {}
          }
        },

        getters: [],

        methods: []
      }
    });

    EnabledPropagator.call(Avatar.prototype);

    return Avatar;
  }
);
