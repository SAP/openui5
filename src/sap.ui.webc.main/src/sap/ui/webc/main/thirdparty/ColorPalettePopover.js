sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/CSSColor", "./generated/templates/ColorPalettePopoverTemplate.lit", "./generated/themes/ColorPalettePopover.css", "./generated/themes/ResponsivePopoverCommon.css", "./generated/i18n/i18n-defaults", "./Button", "./Title", "./ResponsivePopover", "./ColorPalette"], function (_exports, _UI5Element, _LitRenderer, _i18nBundle, _CSSColor, _ColorPalettePopoverTemplate, _ColorPalettePopover, _ResponsivePopoverCommon, _i18nDefaults, _Button, _Title, _ResponsivePopover, _ColorPalette) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _CSSColor = _interopRequireDefault(_CSSColor);
  _ColorPalettePopoverTemplate = _interopRequireDefault(_ColorPalettePopoverTemplate);
  _ColorPalettePopover = _interopRequireDefault(_ColorPalettePopover);
  _ResponsivePopoverCommon = _interopRequireDefault(_ResponsivePopoverCommon);
  _Button = _interopRequireDefault(_Button);
  _Title = _interopRequireDefault(_Title);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _ColorPalette = _interopRequireDefault(_ColorPalette);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-color-palette-popover",
    managedSlots: true,
    properties:
    /** @lends sap.ui.webcomponents.main.ColorPalettePopover.prototype */
    {
      /**
       * Defines whether the user can see the last used colors in the bottom of the component
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      showRecentColors: {
        type: Boolean
      },

      /**
       * Defines whether the user can choose a custom color from a component.
       * <b>Note:</b> In order to use this property you need to import the following module: <code>"@ui5/webcomponents/dist/features/ColorPaletteMoreColors.js"</code>
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      showMoreColors: {
        type: Boolean
      },

      /**
       * Defines whether the user can choose the default color from a button.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      showDefaultColor: {
        type: Boolean
      },

      /**
       * Defines the default color of the component.
       * <b>Note:</b> The default color should be a part of the ColorPalette colors</code>
       * @type {CSSColor}
       * @public
       */
      defaultColor: {
        type: _CSSColor.default
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.ColorPalettePopover.prototype */
    {
      /**
       * Defines the content of the component.
       * @type {sap.ui.webcomponents.main.IColorPaletteItem[]}
       * @slot colors
       * @public
       */
      "default": {
        type: HTMLElement,
        propertyName: "colors",
        individualSlots: true
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.ColorPalettePopover.prototype */
    {
      /**
       * Fired when the user selects a color.
       *
       * @event sap.ui.webcomponents.main.ColorPalettePopover#item-click
       * @public
       * @param {string} color the selected color
       */
      "item-click": {
        detail: {
          color: {
            type: String
          }
        }
      }
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * Represents a predefined range of colors for easier selection.
   *
   * Overview
   * The ColorPalettePopover provides the users with a slot to predefine colors.
   *
   * You can customize them with the use of the colors property. You can specify a defaultColor and display a "Default color" button for the user to choose directly.
   * You can display a "More colors..." button that opens an additional color picker for the user to choose specific colors that are not present in the predefined range.
   *
   * <h3>Usage</h3>
   *
   * The palette is intended for users, who don't want to check and remember the different values of the colors and spend large amount of time to configure the right color through the color picker.
   *
   * For the <code>ui5-color-palette-popover</code>
   * <h3>ES6 Module Import</h3>
   *
   * <code>import @ui5/webcomponents/dist/ColorPalettePopover.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.ColorPalettePopover
   * @extends UI5Element
   * @tagname ui5-color-palette-popover
   * @public
   * @since 1.0.0-rc.16
   */

  class ColorPalettePopover extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get styles() {
      return [_ResponsivePopoverCommon.default, _ColorPalettePopover.default];
    }

    static get template() {
      return _ColorPalettePopoverTemplate.default;
    }

    static get dependencies() {
      return [_ResponsivePopover.default, _Button.default, _Title.default, _ColorPalette.default];
    }

    static async onDefine() {
      ColorPalettePopover.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

    constructor() {
      super();
    }

    _respPopover() {
      this.responsivePopover = this.shadowRoot.querySelector("[ui5-responsive-popover]");
      return this.responsivePopover;
    }

    _colorPalette() {
      return this.responsivePopover.content[0].querySelector("[ui5-color-palette]");
    }
    /**
     * Shows the ColorPalettePopover.
     * @param {HTMLElement} opener the element that the popover is shown at
     * @public
     * @since 1.1.1
     */


    showAt(opener) {
      this._openPopover(opener);
    }
    /**
     * Shows the ColorPalettePopover.
     * <b>Note:</b> The method is deprecated and will be removed in future, use <code>showAt</code> instead.
     * @param {HTMLElement} opener the element that the popover is shown at
     * @public
     * @since 1.0.0-rc.16
     * @deprecated The method is deprecated in favour of <code>showAt</code>.
     */


    openPopover(opener) {
      console.warn("The method 'openPopover' is deprecated and will be removed in future, use 'showAt' instead."); // eslint-disable-line

      this._openPopover(opener);
    }

    _openPopover(opener) {
      this._respPopover();

      this.responsivePopover.showAt(opener, true);

      if (this.showDefaultColor) {
        this._colorPalette().colorPaletteNavigationElements[0].focus();
      } else {
        this._colorPalette().focusColorElement(this._colorPalette().colorPaletteNavigationElements[0], this._colorPalette()._itemNavigation);
      }
    }

    closePopover() {
      this.responsivePopover.close();
    }

    onSelectedColor(event) {
      this.closePopover();
      this.fireEvent("item-click", event.detail);
    }
    /**
     * Returns if the component is opened.
     *
     * @protected
     * @since 1.0.0-rc.16
     * @returns {boolean}
     */


    isOpen() {
      this._respPopover();

      return this.responsivePopover.opened;
    }

    get colorPaletteColors() {
      return this.getSlottedNodes("colors");
    }

    get _colorPaletteTitle() {
      return ColorPalettePopover.i18nBundle.getText(_i18nDefaults.COLORPALETTE_POPOVER_TITLE);
    }

    get _cancelButtonLabel() {
      return ColorPalettePopover.i18nBundle.getText(_i18nDefaults.COLOR_PALETTE_DIALOG_CANCEL_BUTTON);
    }

  }

  ColorPalettePopover.define();
  var _default = ColorPalettePopover;
  _exports.default = _default;
});