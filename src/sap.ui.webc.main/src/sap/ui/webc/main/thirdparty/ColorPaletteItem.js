sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/CSSColor", "sap/ui/webc/common/thirdparty/base/Device", "./generated/templates/ColorPaletteItemTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/ColorPaletteItem.css"], function (_exports, _UI5Element, _LitRenderer, _i18nBundle, _CSSColor, _Device, _ColorPaletteItemTemplate, _i18nDefaults, _ColorPaletteItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _CSSColor = _interopRequireDefault(_CSSColor);
  _ColorPaletteItemTemplate = _interopRequireDefault(_ColorPaletteItemTemplate);
  _ColorPaletteItem = _interopRequireDefault(_ColorPaletteItem);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Styles

  /**
  * @public
  */
  const metadata = {
    tag: "ui5-color-palette-item",
    managedSlots: true,
    properties:
    /** @lends sap.ui.webcomponents.main.ColorPaletteItem.prototype */
    {
      /**
       * Defines the colour of the component.
       * <br><br>
       * <b>Note:</b> The value should be a valid CSS color.
       *
       * @type {CSSColor}
       * @public
       */
      value: {
        type: _CSSColor.default
      },

      /**
       * Defines the tab-index of the element, helper information for the ItemNavigation.
       * @private
       */
      _tabIndex: {
        type: String,
        defaultValue: "-1",
        noAttribute: true
      },

      /**
       * Defines the index of the item inside of the ColorPalette.
       * @private
       * @type {string}
       */
      index: {
        type: String
      },

      /**
       * Defines if the ColorPalette is on phone mode.
       * @private
       * @type {boolean}
       */
      phone: {
        type: Boolean
      },

      /**
       * @private
       * @type {boolean}
       * @since 1.0.0-rc.15
       */
      _disabled: {
        type: Boolean
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.ColorPaletteItem.prototype */
    {},
    events:
    /** @lends sap.ui.webcomponents.main.ColorPaletteItem.prototype */
    {}
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-color-palette-item</code> component represents a color in the the <code>ui5-color-palette</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.ColorPaletteItem
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-color-palette-item
   * @since 1.0.0-rc.12
   * @implements sap.ui.webcomponents.main.IColorPaletteItem
   * @public
   */

  class ColorPaletteItem extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get styles() {
      return _ColorPaletteItem.default;
    }

    static get template() {
      return _ColorPaletteItemTemplate.default;
    }

    static async onDefine() {
      ColorPaletteItem.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

    constructor() {
      super();
    }

    onBeforeRendering() {
      this._disabled = !this.value;
      this.phone = (0, _Device.isPhone)();
    }

    get colorLabel() {
      return ColorPaletteItem.i18nBundle.getText(_i18nDefaults.COLORPALETTE_COLOR_LABEL);
    }

    get styles() {
      return {
        root: {
          "background-color": this.value
        }
      };
    }

  }

  ColorPaletteItem.define();
  var _default = ColorPaletteItem;
  _exports.default = _default;
});