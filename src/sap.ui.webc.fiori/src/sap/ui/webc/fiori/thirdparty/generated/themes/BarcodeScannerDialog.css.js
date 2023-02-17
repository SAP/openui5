sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Themes", "sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css", "./sap_fiori_3/parameters-bundle.css"], function (_exports, _Themes, _parametersBundle, _parametersBundle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _parametersBundle = _interopRequireDefault(_parametersBundle);
  _parametersBundle2 = _interopRequireDefault(_parametersBundle2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-theming", "sap_fiori_3", () => _parametersBundle.default);
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-fiori", "sap_fiori_3", () => _parametersBundle2.default);
  var _default = {
    packageName: "@ui5/webcomponents-fiori",
    fileName: "themes/BarcodeScannerDialog.css",
    content: ".ui5-barcode-scanner-dialog-root::part(content){padding:.4375rem}.ui5-barcode-scanner-dialog-video,.ui5-barcode-scanner-dialog-video-wrapper{height:100%;width:100%}.ui5-barcode-scanner-dialog-video{object-fit:cover}.ui5-barcode-scanner-dialog-footer{display:flex;justify-content:flex-end;width:100%}.ui5-barcode-scanner-dialog-busy{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1}.ui5-barcode-scanner-dialog-busy:not([active]){display:none}"
  };
  _exports.default = _default;
});