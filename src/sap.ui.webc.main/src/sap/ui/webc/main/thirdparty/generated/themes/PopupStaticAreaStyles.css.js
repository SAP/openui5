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
    fileName: "themes/PopupStaticAreaStyles.css",
    content: ".ui5-block-layer {\n\tdisplay: none;\n\tposition: fixed;\n\tbackground-color: var(--sapBlockLayer_Background);\n\topacity: 0.6;\n\ttop: -500px;\n\tleft: -500px;\n\tright: -500px;\n\tbottom: -500px;\n\toutline: none;\n\tpointer-events: all;\n\tz-index: -1;\n}\n\n.ui5-block-layer:not([hidden]) {\n\tdisplay: inline-block;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});