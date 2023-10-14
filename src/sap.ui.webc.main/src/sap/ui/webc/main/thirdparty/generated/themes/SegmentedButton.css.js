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
    fileName: "themes/SegmentedButton.css",
    content: ":host{vertical-align:middle}.ui5-hidden-text{clip:rect(1px,1px,1px,1px);font-size:0;left:-1000px;pointer-events:none;position:absolute;top:-1000px;user-select:none}:host(:not([hidden])){display:inline-block;min-width:calc(var(--_ui5-v1-18-0_segmented_btn_items_count)*2.5rem)}.ui5-segmented-button-root{background-color:var(--sapButton_Background);border-radius:var(--sapButton_BorderCornerRadius);box-shadow:inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_BorderColor);display:grid;grid-template-columns:repeat(var(--_ui5-v1-18-0_segmented_btn_items_count),minmax(2.5rem,1fr));margin:0;padding:0;width:inherit}::slotted([ui5-segmented-button-item]){background-color:var(--_ui5-v1-18-0_segmented_btn_background_color);border-color:var(--_ui5-v1-18-0_segmented_btn_border_color);border-radius:var(--_ui5-v1-18-0_segmented_btn_inner_border_radius);height:var(--_ui5-v1-18-0_button_base_height);min-width:2.5rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;z-index:auto}::slotted([ui5-segmented-button-item]:hover){background-color:var(--sapButton_Hover_Background);border-color:var(--sapButton_Hover_BorderColor);box-shadow:var(--_ui5-v1-18-0_segmented_btn_hover_box_shadow);z-index:2}::slotted([ui5-segmented-button-item][active]),::slotted([ui5-segmented-button-item][pressed]){background-color:var(--sapButton_Selected_Background);border-color:var(--sapButton_Selected_BorderColor);color:var(--sapButton_Selected_TextColor)}::slotted([ui5-segmented-button-item][pressed]:hover){background-color:var(--sapButton_Selected_Hover_Background);border-color:var(--sapButton_Selected_Hover_BorderColor);color:var(--sapButton_Selected_TextColor)}::slotted([ui5-segmented-button-item]:last-child){border-end-end-radius:var(--sapButton_BorderCornerRadius);border-start-end-radius:var(--sapButton_BorderCornerRadius)}::slotted([ui5-segmented-button-item]:first-child){border-end-start-radius:var(--sapButton_BorderCornerRadius);border-start-start-radius:var(--sapButton_BorderCornerRadius)}::slotted([ui5-segmented-button-item]:not(:first-child)){border-left-width:var(--_ui5-v1-18-0_segmented_btn_item_border_left);border-right-width:var(--_ui5-v1-18-0_segmented_btn_item_border_right)}::slotted([ui5-segmented-button-item][active]:not([active]):hover){border-color:var(--sapButton_BorderColor)}::slotted([ui5-segmented-button-item][active]:hover){border-color:var(--sapButton_Selected_BorderColor)}"
  };
  var _default = styleData;
  _exports.default = _default;
});