sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/CSSColor", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/types/Integer", "./generated/templates/ColorPaletteItemTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/ColorPaletteItem.css"], function (_exports, _UI5Element, _customElement, _property, _LitRenderer, _i18nBundle, _CSSColor, _Device, _Integer, _ColorPaletteItemTemplate, _i18nDefaults, _ColorPaletteItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _CSSColor = _interopRequireDefault(_CSSColor);
  _Integer = _interopRequireDefault(_Integer);
  _ColorPaletteItemTemplate = _interopRequireDefault(_ColorPaletteItemTemplate);
  _ColorPaletteItem = _interopRequireDefault(_ColorPaletteItem);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var ColorPaletteItem_1;

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-color-palette-item</code> component represents a color in the the <code>ui5-color-palette</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ColorPaletteItem
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-color-palette-item
   * @since 1.0.0-rc.12
   * @implements sap.ui.webc.main.IColorPaletteItem
   * @public
   */
  let ColorPaletteItem = ColorPaletteItem_1 = class ColorPaletteItem extends _UI5Element.default {
    static async onDefine() {
      ColorPaletteItem_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    constructor() {
      super();
    }
    onBeforeRendering() {
      this._disabled = !this.value;
      this.phone = (0, _Device.isPhone)();
    }
    get colorLabel() {
      return ColorPaletteItem_1.i18nBundle.getText(_i18nDefaults.COLORPALETTE_COLOR_LABEL);
    }
    get styles() {
      return {
        root: {
          "background-color": this.value
        }
      };
    }
  };
  __decorate([(0, _property.default)({
    validator: _CSSColor.default
  })], ColorPaletteItem.prototype, "value", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "-1",
    noAttribute: true
  })], ColorPaletteItem.prototype, "_tabIndex", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default
  })], ColorPaletteItem.prototype, "index", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ColorPaletteItem.prototype, "phone", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ColorPaletteItem.prototype, "_disabled", void 0);
  ColorPaletteItem = ColorPaletteItem_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-color-palette-item",
    renderer: _LitRenderer.default,
    styles: _ColorPaletteItem.default,
    template: _ColorPaletteItemTemplate.default
  })], ColorPaletteItem);
  ColorPaletteItem.define();
  var _default = ColorPaletteItem;
  _exports.default = _default;
});