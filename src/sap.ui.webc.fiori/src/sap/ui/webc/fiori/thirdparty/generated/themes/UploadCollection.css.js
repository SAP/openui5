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
    content: ":host(:not([hidden])){display:block}.ui5-uc-content{position:relative}.uc-no-files{background-color:var(--sapGroup_ContentBackground)}.uc-dnd-overlay{align-items:center;bottom:.5rem;display:flex;flex-direction:column;justify-content:center;left:.5rem;position:absolute;right:.5rem;top:.5rem}.uc-drag-overlay{border:var(--ui5-v1-18-0_upload_collection_drag_overlay_border)}.uc-drop-overlay{border:var(--ui5-v1-18-0_upload_collection_drop_overlay_border)}.uc-dnd-overlay:before{background-color:var(--sapGroup_ContentBackground);bottom:0;content:\"\";left:0;opacity:.8;position:absolute;right:0;top:0}.uc-drop-overlay:after{background-color:var(--ui5-v1-18-0_upload_collection_drop_overlay_background);bottom:0;content:\"\";left:0;opacity:.05;position:absolute;right:0;top:0}.uc-dnd-overlay [ui5-icon]{color:var(--sapContent_NonInteractiveIconColor);height:4rem;margin-bottom:1rem;width:4rem}.uc-dnd-overlay .dnd-overlay-text{color:var(--sapContent_NonInteractiveIconColor);font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontHeader4Size)}.uc-dnd-overlay .dnd-overlay-text,.uc-dnd-overlay [ui5-icon]{pointer-events:none;z-index:1}.uc-drop-overlay .dnd-overlay-text,.uc-drop-overlay [ui5-icon]{color:var(--sapContent_DragAndDropActiveColor)}.uc-no-files-dnd-overlay{visibility:hidden}"
  };
  var _default = styleData;
  _exports.default = _default;
});