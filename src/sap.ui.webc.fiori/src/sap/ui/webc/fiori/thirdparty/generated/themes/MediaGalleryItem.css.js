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
    fileName: "themes/MediaGalleryItem.css",
    content: ":host{display:flex;height:100%;position:relative;width:100%}:host([_square]){height:0;padding-top:100%}.ui5-media-gallery-item-root{display:flex;height:100%;width:100%}:host([_square]) .ui5-media-gallery-item-root{left:0;position:absolute;top:0}:host([layout=Wide]) .ui5-media-gallery-item-root{align-items:center}:host([_thumbnail-design]) .ui5-media-gallery-item-root{border:var(--_ui5-v1-18-0_media_gallery_thumbnail_border);box-sizing:border-box}:host([_interactive]) .ui5-media-gallery-item-root{cursor:pointer}:host([_thumbnail-design]:not([disabled]):not([selected])) .ui5-media-gallery-item-root:hover{background:var(--sapList_Hover_Background);border-color:var(--sapTile_Interactive_BorderColor)}:host([focused]) .ui5-media-gallery-item-root{outline:var(--_ui5-v1-18-0_media_gallery_thumbnail_focus_outline);outline-offset:-1px}:host([_thumbnail-design][selected]) .ui5-media-gallery-item-root{border:var(--_ui5-v1-18-0_media_gallery_thumbnail_selected_border)}:host([_thumbnail-design][focused][selected]) .ui5-media-gallery-item-root{outline-offset:-3px}.ui5-media-gallery-item-wrapper{display:flex;height:100%;justify-content:center;width:100%}:host([layout=Wide]) .ui5-media-gallery-item-wrapper{z-index:1}:host([layout=Wide]:not([_thumbnail-design])) .ui5-media-gallery-item-wrapper{height:56.25%}[ui5-icon]{align-self:center;height:4.55rem;position:absolute;width:4.5rem}.ui5-media-gallery-item-mask-layer{bottom:0;left:0;position:absolute;right:0;top:0;-webkit-user-select:none;-moz-user-select:none;user-select:none}:host(:not([_thumbnail-design])) .ui5-media-gallery-item-mask-layer{background:var(--sapBaseColor);box-shadow:var(--_ui5-v1-18-0_media_gallery_item_overlay_box_shadow);mix-blend-mode:multiply;opacity:.2;pointer-events:none;z-index:2}:host(:not([_thumbnail-design])[layout=Wide]) .ui5-media-gallery-item-mask-layer{z-index:0}:host([disabled]) .ui5-media-gallery-item-mask-layer{background:var(--sapContent_ImagePlaceholderBackground);cursor:default;opacity:.5;z-index:2}::slotted([slot^=thumbnail]),:host([layout=Wide]) ::slotted(*){height:100%;object-fit:cover;width:100%}::slotted(*){margin:auto;max-height:100%;max-width:100%;object-fit:contain}"
  };
  var _default = styleData;
  _exports.default = _default;
});