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
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents", "sap_fiori_3", async () => _parametersBundle2.default);
  const styleData = {
    packageName: "@ui5/webcomponents",
    fileName: "themes/FileUploader.css",
    content: ":host {\n\tvertical-align: middle;\n}\n\n:host {\n\tdisplay: inline-block;\n}\n\n.ui5-file-uploader-root {\n\tposition: relative;\n}\n\n.ui5-file-uploader-root input[type=file] {\n\topacity: 0;\n\tposition: absolute;\n\ttop: 0;\n\tleft: 0;\n\theight: 100%;\n\twidth: 100%;\n}\n\n.ui5-file-uploader-root input[type=file]:not([disabled]) {\n\tcursor: pointer;\n}\n\n.ui5-file-uploader-mask {\n\tdisplay: flex;\n\talign-items: center;\n}\n\n.ui5-file-uploader-mask [ui5-input] {\n\tmargin-right: 0.25rem;\n}\n\n:host([value-state=\"None\"]:not([disabled]):hover) [ui5-input],\n:host(:not([value-state]):not([disabled]):hover) [ui5-input] {\n\tborder: var(--_ui5_file_uploader_hover_border);\n\tbackground-color: var(--sapField_Hover_Background);\n\tbox-shadow: var(--sapField_Hover_Shadow);\n}\n\n:host([value-state=\"Error\"]:not([disabled]):hover) [ui5-input] {\n\tbackground-color: var(--_ui5_file_uploader_value_state_error_hover_background_color);\n\tbox-shadow: var(--sapField_Hover_InvalidShadow);\n}\n\n:host([value-state=\"Warning\"]:not([disabled]):hover) [ui5-input] {\n\tbackground-color: var(--sapField_Hover_Background);\n\tbox-shadow: var(--sapField_Hover_WarningShadow);\n}\n\n:host([value-state=\"Success\"]:not([disabled]):hover) [ui5-input] {\n\tbackground-color: var(--sapField_Hover_Background);\n\tbox-shadow: var(--sapField_Hover_SuccessShadow);\n}\n\n:host([value-state=\"Information\"]:not([disabled]):hover) [ui5-input] {\n\tbackground-color: var(--sapField_Hover_Background);\n\tbox-shadow: var(--sapField_Hover_InformationShadow);\n}\n\n:host(:not([disabled]):active) [ui5-button] {\n\tbackground-color: var(--sapButton_Active_Background);\n\tborder-color: var(--sapButton_Active_BorderColor);\n\tcolor: var(--sapButton_Active_TextColor);\n\ttext-shadow: none;\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});