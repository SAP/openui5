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
    fileName: "themes/WizardPopover.css",
    content: ".ui5-hidden-text {\n\tposition: absolute;\n\tclip: rect(1px,1px,1px,1px);\n\tuser-select: none;\n\tleft: -1000px; /* ensure the invisible texts are never part of the viewport */\n\ttop: -1000px;\n\tpointer-events: none;\n\tfont-size: 0;\n}\n\n.ui5-wizard-responsive-popover {\n\tbox-shadow: var(--sapContent_Shadow1);\n}\n\n.ui5-wizard-responsive-popover-list {\n\tlist-style: none;\n\tmargin: 0;\n\tpadding: 0;\n}\n\n.ui5-responsive-popover-footer {\n\tdisplay: flex;\n\tjustify-content: flex-end;\n\tpadding: 0.25rem 0;\n\twidth: 100%;\n}\n\n.ui5-wizard-popover .ui5-wizard-responsive-popover-list [ui5-button] {\n\twidth: 200px;\n}\n\n.ui5-wizard-dialog .ui5-wizard-responsive-popover-list [ui5-button] {\n\twidth: 100%;\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});