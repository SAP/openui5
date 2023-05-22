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
    fileName: "themes/TabInOverflow.css",
    content: ".ui5-tab-semantic-icon {\n\tdisplay: var(--_ui5_tc_headerItemSemanticIcon_display);\n\theight: var(--_ui5_tc_headerItemSemanticIcon_size);\n\twidth: var(--_ui5_tc_headerItemSemanticIcon_size);\n\tmargin-inline-end: 0.5rem;\n}\n\n.ui5-tab-semantic-icon--positive {\n\tcolor: var(--sapPositiveElementColor);\n}\n\n.ui5-tab-semantic-icon--negative {\n\tcolor: var(--sapNegativeElementColor);\n}\n\n.ui5-tab-semantic-icon--critical {\n\tcolor: var(--sapCriticalElementColor);\n}\n\n.ui5-hidden-text {\n\tposition: absolute;\n\tclip: rect(1px,1px,1px,1px);\n\tuser-select: none;\n\tleft: -1000px; /* ensure the invisible texts are never part of the viewport */\n\ttop: -1000px;\n\tpointer-events: none;\n\tfont-size: 0;\n}\n\n.ui5-tab-overflow-item {\n\tcolor: var(--_ui5_tc_overflowItem_default_color);\n}\n\n.ui5-tab-overflow-item--disabled {\n\tcursor: default;\n\topacity: var(--sapContent_DisabledOpacity);\n}\n\n.ui5-tab-overflow-item[hidden] {\n\tdisplay: none;\n}\n\n.ui5-tab-semantic-icon {\n\tposition: absolute;\n\tinset-inline-start: -0.25rem;\n}\n\n.ui5-tab-overflow-item--positive:not(.ui5-tab-overflow-item--disabled) .ui5-tab-overflow-itemContent {\n\tcolor: var(--_ui5_tc_overflowItem_positive_color);\n}\n\n.ui5-tab-overflow-item--negative:not(.ui5-tab-overflow-item--disabled) .ui5-tab-overflow-itemContent {\n\tcolor: var(--_ui5_tc_overflowItem_negative_color);\n}\n\n.ui5-tab-overflow-item--critical:not(.ui5-tab-overflow-item--disabled) .ui5-tab-overflow-itemContent {\n\tcolor: var(--_ui5_tc_overflowItem_critical_color);\n}\n\n.ui5-tab-overflow-item[active] .ui5-tab-overflow-itemContent {\n\tcolor: var(--sapList_Active_TextColor);\n}\n\n.ui5-tab-overflow-itemContent {\n\tdisplay: flex;\n\talign-items: center;\n\tposition: relative;\n\tpadding-inline: 1rem 0.5rem;\n\theight: var(--_ui5_tc_item_text);\n\tpointer-events: none;\n\tfont-size: 0.875rem;\n}\n\n.ui5-tab-overflow-itemContent-wrapper {\n\tpadding-inline-start: calc(var(--_ui5-tab-indentation-level) * 0.5rem + var(--_ui5-tab-extra-indent, 0) * var(--_ui5_tc_overflowItem_extraIndent));\n}\n\n.ui5-tab-overflow-item--selectedSubTab {\n\tbackground-color: var(--sapList_SelectionBackgroundColor);\n}\n\n.ui5-tab-overflow-item [ui5-icon]:not(.ui5-tab-semantic-icon) {\n\twidth: 1.375rem;\n\theight: 1.375rem;\n\tpadding-inline-end: 0.75rem;\n\tcolor: var(--_ui5_tc_overflowItem_current_color);\n}\n\n.ui5-tab-container-responsive-popover [ui5-li-custom][focused]::part(native-li)::after {\n\tinset: var(--_ui5_tc_overflowItem_focus_offset);\n}\n\n.ui5-tab-container-responsive-popover::part(content) {\n\tpadding: 0;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});