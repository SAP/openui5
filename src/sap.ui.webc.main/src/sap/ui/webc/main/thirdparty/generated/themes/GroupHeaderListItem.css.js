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
    fileName: "themes/GroupHeaderListItem.css",
    content: ".ui5-hidden-text {\n\tposition: absolute;\n\tclip: rect(1px,1px,1px,1px);\n\tuser-select: none;\n\tleft: -1000px; /* ensure the invisible texts are never part of the viewport */\n\ttop: -1000px;\n\tpointer-events: none;\n\tfont-size: 0;\n}\n\n:host {\n\theight: var(--_ui5_group_header_list_item_height);\n\tbackground: var(--ui5-group-header-listitem-background-color);\n\tcolor: var(--sapList_TableGroupHeaderTextColor);\n}\n\n:host([has-border]) {\n\tborder-bottom: 1px solid var(--sapList_GroupHeaderBorderColor);\n}\n\n.ui5-li-root.ui5-ghli-root {\n\tpadding-top: 0.5rem;\n\tcolor: currentColor;\n\tfont-size: var(--sapFontHeader6Size);\n\tfont-weight: normal;\n\tline-height: 2rem;\n\tmargin: 0;\n}\n\n.ui5-ghli-title {\n\tdisplay: block;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\twhite-space: nowrap;\n\tfont-weight: bold;\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});