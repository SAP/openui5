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
    content: ":host{vertical-align:middle}:host{display:inline-block}.ui5-file-uploader-root{position:relative}.ui5-file-uploader-root input[type=file]{height:100%;left:0;opacity:0;position:absolute;top:0;width:100%}.ui5-file-uploader-root input[type=file]:not([disabled]){cursor:pointer}.ui5-file-uploader-mask{align-items:center;display:flex}.ui5-file-uploader-mask [ui5-input]{margin-right:.25rem}:host(:not([value-state]):not([disabled]):hover) [ui5-input],:host([value-state=None]:not([disabled]):hover) [ui5-input]{background-color:var(--sapField_Hover_Background);border:var(--_ui5-v1-18-0_file_uploader_hover_border);box-shadow:var(--sapField_Hover_Shadow)}:host([value-state=Error]:not([disabled]):hover) [ui5-input]{background-color:var(--_ui5-v1-18-0_file_uploader_value_state_error_hover_background_color);box-shadow:var(--sapField_Hover_InvalidShadow)}:host([value-state=Warning]:not([disabled]):hover) [ui5-input]{background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_WarningShadow)}:host([value-state=Success]:not([disabled]):hover) [ui5-input]{background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_SuccessShadow)}:host([value-state=Information]:not([disabled]):hover) [ui5-input]{background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_InformationShadow)}:host(:not([disabled]):active) [ui5-button]{background-color:var(--sapButton_Active_Background);border-color:var(--sapButton_Active_BorderColor);color:var(--sapButton_Active_TextColor);text-shadow:none}"
  };
  var _default = styleData;
  _exports.default = _default;
});