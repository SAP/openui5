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
    fileName: "themes/UploadCollection.css",
    content: ":host(:not([hidden])) {\n\tdisplay: block;\n}\n\n.ui5-uc-content {\n\tposition: relative;\n}\n\n/* No Files */\n\n.uc-no-files {\n\tbox-sizing: border-box;\n\tdisplay: flex;\n\tflex-direction: column;\n\talign-items: center;\n\tjustify-content: center;\n\tpadding: 1rem;\n\tbackground-color: var(--sapGroup_ContentBackground);\n}\n\n.uc-no-files .title {\n\tfont-size: var(--sapFontHeader2Size);\n\tcolor: var(--sapGroup_TitleTextColor);\n\tmargin: 1rem 0;\n}\n\n.uc-no-files .subtitle {\n\tfont-size: var(--sapFontHeader5Size);\n\tcolor: var(--sapContent_LabelColor);\n    margin-bottom: 2rem;\n}\n\n/* Drag and Drop */\n\n.uc-dnd-overlay {\n\tposition: absolute;\n\ttop: 0.5rem;\n\tright: 0.5rem;\n\tleft: 0.5rem;\n\tbottom: 0.5rem;\n\tdisplay: flex;\n\tflex-direction: column;\n\talign-items: center;\n\tjustify-content: center;\n}\n\n.uc-drag-overlay {\n\tborder: var(--ui5_upload_collection_drag_overlay_border);\n}\n\n.uc-drop-overlay {\n\tborder: var(--ui5_upload_collection_drop_overlay_border);\n}\n\n/* use pseudo element to set opacity only for the content and not on the border */\n\n.uc-dnd-overlay::before {\n\tcontent: \"\";\n\tposition: absolute;\n\ttop: 0;\n\tbottom: 0;\n\tleft: 0;\n\tright: 0;\n\tbackground-color: var(--sapGroup_ContentBackground);\n\topacity: 0.8;\n}\n\n/* use pseudo element to set opacity only for the content and not on the border */\n\n.uc-drop-overlay::after {\n\tcontent: \"\";\n\tposition: absolute;\n\ttop: 0;\n\tbottom: 0;\n\tleft: 0;\n\tright: 0;\n\tbackground-color: var(--ui5_upload_collection_drop_overlay_background);\n\topacity: 0.05;\n}\n\n.uc-dnd-overlay [ui5-icon] {\n\twidth: 4rem;\n\theight: 4rem;\n\tmargin-bottom: 1rem;\n\tcolor: var(--sapContent_NonInteractiveIconColor);\n}\n\n.uc-dnd-overlay .dnd-overlay-text {\n\tfont-family: \"72override\", var(--sapFontFamily);\n\tfont-size: var(--sapFontHeader4Size);\n\tcolor: var(--sapContent_NonInteractiveIconColor);\n}\n\n.uc-dnd-overlay [ui5-icon],\n.uc-dnd-overlay .dnd-overlay-text {\n\tz-index: 1;\n\tpointer-events: none;\n}\n\n.uc-drop-overlay [ui5-icon],\n.uc-drop-overlay .dnd-overlay-text {\n\tcolor: var(--sapContent_DragAndDropActiveColor);\n}\n\n.uc-no-files-dnd-overlay {\n\tvisibility: hidden;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});