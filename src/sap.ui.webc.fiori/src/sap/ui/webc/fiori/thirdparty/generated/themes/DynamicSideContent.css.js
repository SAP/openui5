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
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-fiori", "sap_fiori_3", async () => _parametersBundle2.default);
  const styleData = {
    packageName: "@ui5/webcomponents-fiori",
    fileName: "themes/DynamicSideContent.css",
    content: ":host {\n\tdisplay: block;\n\twidth: 100%;\n\theight: 100%;\n\tposition: relative;\n}\n\n.ui5-dsc-root {\n\twidth: 100%;\n\theight: 100%;\n\tposition: relative;\n\toverflow-x: hidden;\n\toverflow-y: auto;\n\tdisplay: flex;\n}\n\n.ui5-dsc-main,\n.ui5-dsc-side {\n\tdisplay: inline;\n\tposition: relative;\n\toverflow-x: hidden;\n\toverflow-y: auto;\n\tbox-sizing: border-box;\n\tflex: none;\n}\n\n.ui5-dsc-root > div[class^=\"ui5-dcs-span\"],\n.ui5-dsc-root > aside[class^=\"ui5-dsc-span\"] {\n\toverflow: auto;\n}\n\n.ui5-dsc-main.ui5-dsc-span-fixed {\n\twidth: calc(100% - 21.25rem);\n}\n\n.ui5-dsc-side.ui5-dsc-span-fixed {\n\twidth: 21.25rem;\n}\n\n.ui5-dsc-root > .ui5-dsc-span-0 {\n\tdisplay: none;\n}\n\n.ui5-dsc-root > .ui5-dsc-span-3 {\n\twidth: 25%;\n}\n\n.ui5-dsc-root > .ui5-dsc-span-4 {\n\twidth: 33.333%;\n}\n\n.ui5-dsc-root > .ui5-dsc-span-6 {\n\twidth: 50%;\n}\n\n.ui5-dsc-root > .ui5-dsc-span-8 {\n\twidth: 66.666%;\n}\n\n.ui5-dsc-root > .ui5-dsc-span-9 {\n\twidth: 75%;\n}\n\n.ui5-dsc-root > .ui5-dsc-span-12 {\n\twidth: 100%;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});