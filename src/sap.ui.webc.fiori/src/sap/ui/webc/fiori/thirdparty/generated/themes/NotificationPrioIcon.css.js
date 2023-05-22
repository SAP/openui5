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
    fileName: "themes/NotificationPrioIcon.css",
    content: ".ui5-prio-icon {\n\tmin-width: 1rem;\n\tmin-height: 1rem;\n\tpadding-inline-end: 0.625rem;\n}\n\n.ui5-prio-icon--message-error {\n\tcolor: var(--sapNegativeElementColor);\n}\n\n.ui5-prio-icon--message-warning {\n\tcolor: var(--sapCriticalElementColor);\n}\n\n.ui5-prio-icon--message-success {\n\tcolor: var(--sapPositiveElementColor);\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});