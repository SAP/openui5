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
    fileName: "themes/ListItemBase.css",
    content: ":host(:not([hidden])){display:block}:host{background:var(--ui5-v1-18-0-listitem-background-color);border-bottom:1px solid transparent;box-sizing:border-box;height:var(--_ui5-v1-18-0_list_item_base_height)}:host([selected]){background:var(--sapList_SelectionBackgroundColor)}:host([has-border]){border-bottom:var(--ui5-v1-18-0-listitem-border-bottom)}:host([selected]){border-bottom:var(--ui5-v1-18-0-listitem-selected-border-bottom)}:host(:not([focused])[selected][has-border]){border-bottom:var(--ui5-v1-18-0-listitem-selected-border-bottom)}:host([focused][selected]){border-bottom:var(--ui5-v1-18-0-listitem-focused-selected-border-bottom)}.ui5-li-root{align-items:center;box-sizing:border-box;display:flex;height:100%;padding:var(--ui5-v1-18-0-listitem-padding);position:relative;width:100%}:host([focused]) .ui5-li-root.ui5-li--focusable{outline:none}:host([focused]) .ui5-li-root.ui5-li--focusable:after{border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--ui5-v1-18-0-listitem-focus-border-radius);bottom:var(--ui5-v1-18-0-listitem-focus-offset);content:\"\";left:var(--ui5-v1-18-0-listitem-focus-offset);pointer-events:none;position:absolute;right:var(--ui5-v1-18-0-listitem-focus-offset);top:var(--ui5-v1-18-0-listitem-focus-offset)}:host([focused]) .ui5-li-content:focus:after{border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);bottom:0;content:\"\";left:0;pointer-events:none;position:absolute;right:0;top:0}:host([active][focused]) .ui5-li-root.ui5-li--focusable:after{border-color:var(--ui5-v1-18-0-listitem-active-border-color)}:host([disabled]){opacity:var(--_ui5-v1-18-0-listitembase_disabled_opacity);pointer-events:none}.ui5-li-content{color:var(--sapList_TextColor);font-family:\"72override\",var(--sapFontFamily);max-width:100%}"
  };
  var _default = styleData;
  _exports.default = _default;
});