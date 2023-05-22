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
    fileName: "themes/Timeline.css",
    content: ":host(:not([hidden])) {\n\tdisplay: block;\n}\n\n.ui5-timeline-root {\n\tpadding: var(--_ui5_tl_padding);\n\tbox-sizing: border-box;\n\toverflow: hidden;\n}\n\n.ui5-timeline-list {\n\tlist-style: none;\n\tmargin: 0;\n\tpadding: 0;\n}\n\n.ui5-timeline-list-item {\n\tmargin-bottom: var(--_ui5_tl_li_margin_bottom);\n}\n\n.ui5-timeline-list-item:last-child {\n\tmargin-bottom: 0;\n}\n\n:host([layout=\"Horizontal\"]) .ui5-timeline-list {\n\twhite-space: nowrap;\n\tlist-style: none;\n\tmargin: 0;\n\tpadding: 0;\n}\n\n:host([layout=\"Horizontal\"]) .ui5-timeline-list-item {\n\tdisplay: inline-block;\n\tmargin-inline-start: var(--_ui5_tl_li_margin_bottom);\n}\n\n:host([layout=\"Horizontal\"]) .ui5-timeline-scroll-container {\n\toverflow: auto;\n\t/* The padding values of the parent container are added to the size of scroll container */\n\twidth: calc(100% + var(--_ui5_timeline_scroll_container_offset));\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});