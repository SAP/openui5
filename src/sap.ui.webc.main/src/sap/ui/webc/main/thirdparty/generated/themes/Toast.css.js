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
    fileName: "themes/Toast.css",
    content: ":host {\n\tfont-family: \"72override\", var(--sapFontFamily);\n\tcolor: var(--sapList_TextColor);\n\tfont-size: var(--sapFontSize);\n}\n\n:host([open]) .ui5-toast-root {\n\tdisplay: block;\n}\n\n.ui5-toast-root {\n\tposition: fixed;\n\tdisplay: none;\n\tbox-sizing: border-box;\n\tmax-width: 15rem;\n\toverflow: hidden;\n\tpadding: 1rem;\n\tbackground: var(--_ui5_toast_background);\n\tbox-shadow: var(--_ui5_toast_shadow);\n\tborder-radius: var(--sapElement_BorderCornerRadius);\n\ttransition-property: opacity;\n\topacity: 1;\n\tfont-family: inherit;\n\tcolor: inherit;\n\tfont-weight: inherit;\n\tfont-size: inherit;\n\tword-wrap: break-word;\n\ttext-align: center;\n\ttext-overflow: ellipsis;\n\twhite-space: pre-line;\n}\n\n:host(:not([placement])) .ui5-toast-root {\n\tbottom: var(--_ui5_toast_vertical_offset);\n\tleft: 50%;\n\ttransform: translateX(-50%);\n}\n\n:host([placement=\"TopStart\"]) .ui5-toast-root {\n\ttop: var(--_ui5_toast_vertical_offset);\n\tleft: var(--_ui5_toast_horizontal_offset);\n}\n\n:host([placement=\"MiddleStart\"]) .ui5-toast-root {\n\tleft: var(--_ui5_toast_horizontal_offset);\n\ttop: 50%;\n\ttransform: translateY(-50%);\n}\n\n:host([placement=\"BottomStart\"]) .ui5-toast-root {\n\tleft: var(--_ui5_toast_horizontal_offset);\n\tbottom: var(--_ui5_toast_vertical_offset);\n}\n\n:host([placement=\"TopCenter\"]) .ui5-toast-root {\n\ttop: var(--_ui5_toast_vertical_offset);\n\tleft: 50%;\n\ttransform: translateX(-50%);\n}\n\n:host([placement=\"MiddleCenter\"]) .ui5-toast-root {\n\tleft: 50%;\n\ttop: 50%;\n\ttransform: translate(-50%, -50%);\n}\n\n:host([placement=\"BottomCenter\"]) .ui5-toast-root {\n\tbottom: var(--_ui5_toast_vertical_offset);\n\tleft: 50%;\n\ttransform: translateX(-50%);\n}\n\n:host([placement=\"TopEnd\"]) .ui5-toast-root {\n\tright: var(--_ui5_toast_horizontal_offset);\n\ttop: var(--_ui5_toast_vertical_offset);\n}\n\n:host([placement=\"MiddleEnd\"]) .ui5-toast-root {\n\tright: var(--_ui5_toast_horizontal_offset);\n\ttop: 50%;\n\ttransform: translateY(-50%);\n}\n\n:host([placement=\"BottomEnd\"]) .ui5-toast-root {\n\tright: var(--_ui5_toast_horizontal_offset);\n\tbottom: var(--_ui5_toast_vertical_offset);\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});