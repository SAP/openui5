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
    fileName: "themes/Card.css",
    content: ".ui5-hidden-text{clip:rect(1px,1px,1px,1px);font-size:0;left:-1000px;pointer-events:none;position:absolute;top:-1000px;user-select:none}:host(:not([hidden])){display:inline-block;width:100%}.ui5-card-root{background:var(--sapTile_Background);border:var(--_ui5-v1-18-0_card_border);border-radius:var(--_ui5-v1-18-0_card_border-radius);box-shadow:var(--_ui5-v1-18-0_card_box_shadow);box-sizing:border-box;color:var(--sapGroup_TitleTextColor);font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize);height:100%;overflow:hidden;width:100%}.ui5-card-root.ui5-card--interactive:hover{box-shadow:var(--_ui5-v1-18-0_card_hover_box_shadow)}.ui5-card-root.ui5-card--interactive:active{box-shadow:var(--_ui5-v1-18-0_card_box_shadow)}.ui5-card-root.ui5-card--nocontent{height:auto}.ui5-card-root.ui5-card--nocontent .ui5-card-header-root{border-bottom:none}.ui5-card--nocontent ::slotted([ui5-card-header]){--_ui5-v1-18-0_card_header_focus_bottom_radius:var(--_ui5-v1-18-0_card_header_focus_radius)}.ui5-card-root .ui5-card-header-root{border-bottom:var(--_ui5-v1-18-0_card_header_border)}"
  };
  var _default = styleData;
  _exports.default = _default;
});