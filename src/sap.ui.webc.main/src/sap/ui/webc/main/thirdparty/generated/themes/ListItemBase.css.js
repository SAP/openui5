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
    content: ":host(:not([hidden])) {\n\tdisplay: block;\n}\n\n:host {\n\theight: var(--_ui5_list_item_base_height);\n\tbackground: var(--ui5-listitem-background-color);\n\tbox-sizing: border-box;\n\tborder-bottom: 1px solid transparent;\n}\n\n/* selected */\n\n:host([selected]) {\n\tbackground: var(--sapList_SelectionBackgroundColor);\n}\n\n:host([has-border]) {\n\tborder-bottom: var(--ui5-listitem-border-bottom);\n}\n\n:host([selected]) {\n\tborder-bottom: var(--ui5-listitem-selected-border-bottom);\n}\n\n:host(:not([focused])[selected][has-border]) {\n\tborder-bottom: var(--ui5-listitem-selected-border-bottom);\n}\n\n/* focused & selected */\n\n:host([focused][selected]) {\n\tborder-bottom: var(--ui5-listitem-focused-selected-border-bottom);\n}\n\n.ui5-li-root {\n\tposition: relative;\n\tdisplay: flex;\n\talign-items: center;\n\twidth: 100%;\n\theight: 100%;\n\tpadding: 0 1rem 0 1rem;\n\tbox-sizing: border-box;\n}\n\n/* focused */\n\n:host([focused]) .ui5-li-root.ui5-li--focusable {\n\toutline: none;\n}\n\n:host([focused]) .ui5-li-root.ui5-li--focusable:after {\n\tcontent: \"\";\n\tborder: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);\n\tposition: absolute;\n\ttop: 0.125rem;\n\tright: 0.125rem;\n\tbottom: 0.125rem;\n\tleft: 0.125rem;\n\tpointer-events: none;\n}\n\n:host([focused]) .ui5-li-content:focus:after {\n\tcontent: \"\";\n\tborder: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);\n\tposition: absolute;\n\ttop: 0;\n\tright: 0;\n\tbottom: 0;\n\tleft: 0;\n\tpointer-events: none;\n}\n\n:host([active][focused]) .ui5-li-root.ui5-li--focusable:after {\n\tborder-color: var(--ui5-listitem-active-border-color);\n}\n\n:host([disabled]) {\n    opacity: var(--_ui5-listitembase_disabled_opacity);\n    pointer-events: none;\n}\n\n.ui5-li-content {\n\tmax-width: 100%;\n\tfont-family: \"72override\", var(--sapFontFamily);\n\tcolor: var(--sapList_TextColor);\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});