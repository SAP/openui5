sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/i18nBundle", "../Dialog", "../Button", "../ColorPicker", "../generated/i18n/i18n-defaults"], function (_exports, _FeaturesRegistry, _i18nBundle, _Dialog, _Button, _ColorPicker, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _Dialog = _interopRequireDefault(_Dialog);
  _Button = _interopRequireDefault(_Button);
  _ColorPicker = _interopRequireDefault(_ColorPicker);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  class ColorPaletteMoreColors {
    static get dependencies() {
      return [_Dialog.default, _Button.default, _ColorPicker.default];
    }
    static async init() {
      ColorPaletteMoreColors.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    get colorPaletteDialogTitle() {
      return ColorPaletteMoreColors.i18nBundle.getText(_i18nDefaults.COLOR_PALETTE_DIALOG_TITLE);
    }
    get colorPaletteDialogOKButton() {
      return ColorPaletteMoreColors.i18nBundle.getText(_i18nDefaults.COLOR_PALETTE_DIALOG_OK_BUTTON);
    }
    get colorPaletteCancelButton() {
      return ColorPaletteMoreColors.i18nBundle.getText(_i18nDefaults.COLOR_PALETTE_DIALOG_CANCEL_BUTTON);
    }
  }
  (0, _FeaturesRegistry.registerFeature)("ColorPaletteMoreColors", ColorPaletteMoreColors);
  var _default = ColorPaletteMoreColors;
  _exports.default = _default;
});