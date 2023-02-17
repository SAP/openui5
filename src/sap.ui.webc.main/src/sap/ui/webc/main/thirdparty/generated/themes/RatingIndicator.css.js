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
    fileName: "themes/RatingIndicator.css",
    content: ":host(:not([hidden])){display:inline-block;font-size:24px;margin:var(--_ui5_rating_indicator_component_spacing);cursor:pointer}:host([disabled]){opacity:.4;cursor:auto;outline:none}:host([readonly]){cursor:auto}:host([disabled]) .ui5-rating-indicator-item-unsel,:host([readonly]) .ui5-rating-indicator-item-unsel{padding-inline:var(--_ui5_rating_indicator_readonly_item_spacing);width:var(--_ui5_rating_indicator_readonly_item_width);height:var(--_ui5_rating_indicator_readonly_item_height)}:host(:not([readonly]):not([disabled])) .ui5-rating-indicator-root:hover{opacity:.9}:host([_focused]){outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);outline-offset:var(--_ui5_rating_indicator_outline_offset);border-radius:var(--_ui5_rating_indicator_border_radius)}[ui5-icon]{display:flex;text-shadow:var(--sapContent_TextShadow)}.ui5-rating-indicator-root{outline:none;position:relative}.ui5-rating-indicator-list{list-style-type:none;display:flex;align-items:center;margin:0;padding:0}.ui5-rating-indicator-item{position:relative;width:var(--_ui5_rating_indicator_item_width);height:var(--_ui5_rating_indicator_item_height)}.ui5-rating-indicator-item:not(:last-child){margin-inline-end:.1875rem}.ui5-rating-indicator-item [ui5-icon]{width:100%;height:100%;color:inherit;user-select:none}.ui5-rating-indicator-item.ui5-rating-indicator-item-sel{color:var(--sapContent_RatedColor)}.ui5-rating-indicator-item.ui5-rating-indicator-item-unsel{color:var(--sapContent_UnratedColor)}.ui5-rating-indicator-item.ui5-rating-indicator-item-half{color:var(--sapContent_UnratedColor)}.ui5-rating-indicator-item [ui5-icon].ui5-rating-indicator-half-icon{position:absolute;inset-inline-start:50%;color:var(--sapContent_RatedColor)}.ui5-rating-indicator-half-icon-wrapper{width:100%;height:100%;position:absolute;inset-inline-start:-50%;top:0;z-index:32;overflow:hidden}"
  };
  _exports.default = _default;
});