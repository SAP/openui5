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
    fileName: "themes/Timeline.css",
    content: ":host(:not([hidden])){display:block}.ui5-timeline-root{padding:var(--_ui5_tl_padding);box-sizing:border-box;overflow:hidden}.ui5-timeline-list{list-style:none;margin:0;padding:0}.ui5-timeline-list-item{margin-bottom:var(--_ui5_tl_li_margin_bottom)}.ui5-timeline-list-item:last-child{margin-bottom:0}:host([layout=Horizontal]) .ui5-timeline-list{white-space:nowrap;list-style:none;margin:0;padding:0}:host([layout=Horizontal]) .ui5-timeline-list-item{display:inline-block;margin-inline-start:var(--_ui5_tl_li_margin_bottom)}:host([layout=Horizontal]) .ui5-timeline-scroll-container{overflow:auto;width:calc(100% + var(--_ui5_timeline_scroll_container_offset))}"
  };
  _exports.default = _default;
});