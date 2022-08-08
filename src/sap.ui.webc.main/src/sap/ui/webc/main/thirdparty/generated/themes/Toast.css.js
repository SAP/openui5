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
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents", "sap_fiori_3", () => _parametersBundle2.default);
  var _default = {
    packageName: "@ui5/webcomponents",
    fileName: "themes/Toast.css",
    content: ":host{font-family:\"72override\",var(--sapFontFamily);color:var(--sapList_TextColor);font-size:var(--sapFontSize)}:host([open]) .ui5-toast-root{display:block}.ui5-toast-root{position:fixed;display:none;box-sizing:border-box;max-width:15rem;overflow:hidden;padding:1rem;background:var(--_ui5_toast_background);box-shadow:var(--_ui5_toast_shadow);border-radius:var(--sapElement_BorderCornerRadius);transition-property:opacity;opacity:1;font-family:inherit;color:inherit;font-weight:inherit;font-size:inherit;word-wrap:break-word;text-align:center;text-overflow:ellipsis;white-space:pre-line}:host(:not([placement])) .ui5-toast-root{bottom:var(--_ui5_toast_vertical_offset);left:50%;transform:translateX(-50%)}:host([placement=TopStart]) .ui5-toast-root{top:var(--_ui5_toast_vertical_offset);left:var(--_ui5_toast_horizontal_offset)}:host([placement=MiddleStart]) .ui5-toast-root{left:var(--_ui5_toast_horizontal_offset);top:50%;transform:translateY(-50%)}:host([placement=BottomStart]) .ui5-toast-root{left:var(--_ui5_toast_horizontal_offset);bottom:var(--_ui5_toast_vertical_offset)}:host([placement=TopCenter]) .ui5-toast-root{top:var(--_ui5_toast_vertical_offset);left:50%;transform:translateX(-50%)}:host([placement=MiddleCenter]) .ui5-toast-root{left:50%;top:50%;transform:translate(-50%,-50%)}:host([placement=BottomCenter]) .ui5-toast-root{bottom:var(--_ui5_toast_vertical_offset);left:50%;transform:translateX(-50%)}:host([placement=TopEnd]) .ui5-toast-root{right:var(--_ui5_toast_horizontal_offset);top:var(--_ui5_toast_vertical_offset)}:host([placement=MiddleEnd]) .ui5-toast-root{right:var(--_ui5_toast_horizontal_offset);top:50%;transform:translateY(-50%)}:host([placement=BottomEnd]) .ui5-toast-root{right:var(--_ui5_toast_horizontal_offset);bottom:var(--_ui5_toast_vertical_offset)}"
  };
  _exports.default = _default;
});