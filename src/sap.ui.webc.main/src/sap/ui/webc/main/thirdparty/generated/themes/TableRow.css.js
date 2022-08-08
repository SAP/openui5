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
    fileName: "themes/TableRow.css",
    content: ":host{display:contents}:host([_busy]) .ui5-table-row-root{opacity:.72;pointer-events:none}.ui5-table-row-root{background-color:var(--sapList_Background);color:var(--sapList_TextColor);border-top:1px solid var(--sapList_BorderColor);height:var(--ui5_table_row_height)}.ui5-table-row-root:focus{outline:var(--ui5_table_row_outline_width) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);outline-offset:var(--ui5_table_focus_outline_offset)}.ui5-table-popin-row{background-color:var(--sapList_Background)}.ui5-table-popin-row.all-columns-popped-in.popin-header{border-top:1px solid var(--sapList_BorderColor)}.ui5-table-popin-row td{padding-top:.5rem;padding-left:1rem}.ui5-table-popin-row:last-child td{padding-bottom:.5rem}.ui5-table-row-popin-title{color:var(--sapContent_LabelColor);font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize)}.ui5-table-multi-select-cell{padding:.25rem 0;box-sizing:border-box;text-align:center;vertical-align:middle}:host([mode=SingleSelect]) .ui5-table-row-root{cursor:pointer}:host([mode=MultiSelect]) .ui5-table-row-root .ui5-table-multi-select-cell{cursor:pointer}:host ::slotted([ui5-table-cell]:not([popined])){padding:.25rem .5rem}:host(:not([mode=MultiSelect])) ::slotted([ui5-table-cell]:not([popined]):first-child){padding-left:1rem}:host([mode=SingleSelect]) .ui5-table-row-root:hover:not(:active),:host([type=Active]) .ui5-table-row-root:hover{background-color:var(--sapList_Hover_Background)}:host([selected][type=Active]) .ui5-table-row-root:active,:host([type=Active]) .ui5-table-row-root:active{background-color:var(--sapList_Active_Background)}:host([type=Active]) .ui5-table-row-root:active ::slotted([ui5-table-cell]){color:var(--sapList_Active_TextColor)}:host([selected]) .ui5-table-row-root:not(:active){background-color:var(--sapList_SelectionBackgroundColor);border-bottom:1px solid var(--sapList_SelectionBorderColor)}:host([selected][mode=SingleSelect]) .ui5-table-row-root:hover:not(:active),:host([selected][type=Active]) .ui5-table-row-root:hover:not(:active){background-color:var(--sapList_Hover_SelectionBackground)}"
  };
  _exports.default = _default;
});