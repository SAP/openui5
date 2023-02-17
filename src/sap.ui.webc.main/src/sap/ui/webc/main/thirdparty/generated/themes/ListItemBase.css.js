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
    fileName: "themes/ListItemBase.css",
    content: ":host(:not([hidden])){display:block}:host{height:var(--_ui5_list_item_base_height);background:var(--ui5-listitem-background-color);box-sizing:border-box;border-bottom:1px solid transparent}:host([selected]){background:var(--sapList_SelectionBackgroundColor)}:host([has-border]){border-bottom:var(--ui5-listitem-border-bottom)}:host([selected]){border-bottom:var(--ui5-listitem-selected-border-bottom)}:host(:not([focused])[selected][has-border]){border-bottom:var(--ui5-listitem-selected-border-bottom)}:host([focused][selected]){border-bottom:var(--ui5-listitem-focused-selected-border-bottom)}.ui5-li-root{position:relative;display:flex;align-items:center;width:100%;height:100%;padding:0 1rem 0 1rem;box-sizing:border-box}:host([focused]) .ui5-li-root.ui5-li--focusable{outline:none}:host([focused]) .ui5-li-root.ui5-li--focusable:after{content:\"\";border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);position:absolute;top:.125rem;right:.125rem;bottom:.125rem;left:.125rem;pointer-events:none}:host([focused]) .ui5-li-content:focus:after{content:\"\";border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);position:absolute;top:0;right:0;bottom:0;left:0;pointer-events:none}:host([active][focused]) .ui5-li-root.ui5-li--focusable:after{border-color:var(--ui5-listitem-active-border-color)}:host([disabled]){opacity:var(--_ui5-listitembase_disabled_opacity);pointer-events:none}.ui5-li-content{max-width:100%;font-family:\"72override\",var(--sapFontFamily);color:var(--sapList_TextColor)}"
  };
  _exports.default = _default;
});