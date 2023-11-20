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
    fileName: "themes/Breadcrumbs.css",
    content: ":host(:not([hidden])){display:block;width:100%}.ui5-breadcrumbs-root{margin:0 0 .5rem 0;outline:none;white-space:nowrap}.ui5-breadcrumbs-root>ol{display:-webkit-box;display:-webkit-flex;display:flex;list-style-type:none;margin:0;padding:0}.ui5-breadcrumbs-root>ol>li{display:inline}.ui5-breadcrumbs-current-location{-webkit-box-flex:1;align-self:center;-webkit-flex:1;flex:1 1 auto;font-size:0;min-width:1%}.ui5-breadcrumbs-current-location>span:focus{border-radius:var(--_ui5-v1-18-0_breadcrumbs_current_location_focus_border_radius);outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor)}.ui5-breadcrumbs-dropdown-arrow-link-wrapper[hidden]{display:none}.ui5-breadcrumbs-dropdown-arrow-link-wrapper [ui5-icon]{color:var(--sapLinkColor);height:var(--sapFontSize);padding-left:.675rem;vertical-align:text-top;width:var(--sapFontSize)}.ui5-breadcrumbs-dropdown-arrow-link-wrapper [ui5-link][focused] [ui5-icon]{color:var(--_ui5-v1-18-0_link_focus_color)}.ui5-breadcrumbs-dropdown-arrow-link-wrapper [ui5-icon]:before{bottom:0;content:\"...\";left:0;position:absolute;vertical-align:middle}.ui5-breadcrumbs-dropdown-arrow-link-wrapper [ui5-link][focused] [ui5-icon]:after,.ui5-breadcrumbs-dropdown-arrow-link-wrapper:hover [ui5-icon]:after{border-bottom:.0625rem solid;bottom:1px;content:\"\";left:0;position:absolute;right:0;top:0}li:not(.ui5-breadcrumbs-current-location):after{color:var(--sapContent_LabelColor);content:\"/\";cursor:auto;display:inline-block;font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize);padding:0 .25rem}.ui5-breadcrumbs-popover-footer{display:flex;justify-content:flex-end;width:100%}:host([separator-style=BackSlash]) li:not(.ui5-breadcrumbs-current-location):after{content:\"\\\\\"}:host([separator-style=DoubleBackSlash]) li:not(.ui5-breadcrumbs-current-location):after{content:\"\\\\\\\\\"}:host([separator-style=DoubleGreaterThan]) li:not(.ui5-breadcrumbs-current-location):after{content:\">>\"}:host([separator-style=DoubleSlash]) li:not(.ui5-breadcrumbs-current-location):after{content:\"//\"}:host([separator-style=GreaterThan]) li:not(.ui5-breadcrumbs-current-location):after{content:\">\"}"
  };
  var _default = styleData;
  _exports.default = _default;
});