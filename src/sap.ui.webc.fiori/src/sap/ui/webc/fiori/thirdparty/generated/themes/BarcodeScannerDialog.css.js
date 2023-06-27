sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Themes", "sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css", "./sap_fiori_3/parameters-bundle.css"], function (_exports, _Themes, _parametersBundle, _parametersBundle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _parametersBundle = _interopRequireDefault(_parametersBundle);
  _parametersBundle2 = _interopRequireDefault(_parametersBundle2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-theming", "sap_fiori_3", async () => _parametersBundle.default);
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-fiori", "sap_fiori_3", async () => _parametersBundle2.default);
  const styleData = {
    packageName: "@ui5/webcomponents-fiori",
    fileName: "themes/BarcodeScannerDialog.css",
    content: ".ui5-barcode-scanner-dialog-root::part(content) {\r\n    padding: .4375rem;\r\n}\r\n\r\n/* video */\r\n\r\n.ui5-barcode-scanner-dialog-video-wrapper,\r\n.ui5-barcode-scanner-dialog-video {\r\n    height:100%;\r\n    width: 100%;\r\n}\r\n\r\n.ui5-barcode-scanner-dialog-video {\r\n    object-fit: cover;\r\n}\r\n\r\n/* footer */\r\n\r\n.ui5-barcode-scanner-dialog-footer {\r\n    display: flex;\r\n    justify-content: flex-end;\r\n    width: 100%;\r\n}\r\n\r\n/* busy indicator */\r\n\r\n.ui5-barcode-scanner-dialog-busy {\r\n    position: absolute;\r\n    top: 50%;\r\n    left: 50%;\r\n    transform: translate(-50%, -50%);\r\n    z-index: 1;\r\n}\r\n\r\n.ui5-barcode-scanner-dialog-busy:not([active]) {\r\n\tdisplay: none;\r\n}\r\n"
  };
  var _default = styleData;
  _exports.default = _default;
});