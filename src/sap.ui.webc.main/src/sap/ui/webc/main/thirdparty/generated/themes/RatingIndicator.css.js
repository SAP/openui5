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
    fileName: "themes/RatingIndicator.css",
    content: ":host(:not([hidden])) {\n\tdisplay: inline-block;\n\tfont-size: 24px;\n\tmargin: var(--_ui5_rating_indicator_component_spacing);\n\tcursor: pointer;\n}\n\n:host([disabled]) {\n\topacity: .4;\n\tcursor: initial;\n\toutline: none;\n}\n\n:host([readonly]) {\n\tcursor: initial;\n}\n\n:host([disabled]) .ui5-rating-indicator-item-unsel,\n:host([readonly]) .ui5-rating-indicator-item-unsel {\n\tpadding-inline: var(--_ui5_rating_indicator_readonly_item_spacing);\n\twidth: var(--_ui5_rating_indicator_readonly_item_width);\n\theight: var(--_ui5_rating_indicator_readonly_item_height);\n}\n\n:host(:not([readonly]):not([disabled])) .ui5-rating-indicator-root:hover {\n\topacity: .9;\n}\n\n:host([_focused]) {\n\toutline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);\n\toutline-offset: var(--_ui5_rating_indicator_outline_offset);\n\tborder-radius: var(--_ui5_rating_indicator_border_radius);\n}\n\n[ui5-icon] {\n\tdisplay: flex;\n\ttext-shadow: var(--sapContent_TextShadow);\n}\n\n.ui5-rating-indicator-root {\n\toutline: none;\n\tposition: relative;\n}\n\n.ui5-rating-indicator-list {\n\tlist-style-type: none;\n\tdisplay: flex;\n\talign-items: center;\n\tmargin: 0;\n\tpadding: 0;\n}\n\n.ui5-rating-indicator-item {\n\tposition: relative;\n\twidth: var(--_ui5_rating_indicator_item_width);\n\theight: var(--_ui5_rating_indicator_item_height);\n}\n\n.ui5-rating-indicator-item:not(:last-child) {\n\tmargin-inline-end: 0.1875rem;\n}\n\n.ui5-rating-indicator-item [ui5-icon] {\n\twidth: 100%;\n\theight: 100%;\n\tcolor: inherit;\n\tuser-select: none;\n}\n\n.ui5-rating-indicator-item.ui5-rating-indicator-item-sel {\n\tcolor: var(--sapContent_RatedColor);\n}\n\n.ui5-rating-indicator-item.ui5-rating-indicator-item-unsel {\n\tcolor: var(--sapContent_UnratedColor);\n}\n\n.ui5-rating-indicator-item.ui5-rating-indicator-item-half {\n\tcolor: var(--sapContent_UnratedColor);\n}\n\n.ui5-rating-indicator-item [ui5-icon].ui5-rating-indicator-half-icon {\n\tposition: absolute;\n    inset-inline-start: 50%;\n    color: var(--sapContent_RatedColor);\n}\n\n.ui5-rating-indicator-half-icon-wrapper {\n\twidth: 100%;\n    height: 100%;\n    position: absolute;\n    inset-inline-start: -50%;\n    top: 0;\n    z-index: 32;\n    overflow: hidden;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});