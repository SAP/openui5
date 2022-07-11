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
    fileName: "themes/RangeSlider.css",
    content: ":host([ui5-range-slider]) .ui5-slider-progress-container:before{background-color:var(--_ui5_slider_progress_container_dot_background)}.ui5-slider-root:hover:active .ui5-slider-handle:not(:focus){background:var(--sapSlider_RangeHandleBackground)}.ui5-slider-root:active .ui5-slider-handle:active:focus,.ui5-slider-root:active .ui5-slider-handle:focus{background:var(--_ui5_range_slider_handle_active_background)}.ui5-slider-root:active .ui5-slider-handle:active:focus [slider-icon],.ui5-slider-root:active .ui5-slider-handle:focus [slider-icon]{display:var(--_ui5_range_slider_active_handle_icon_display)}:host([range-pressed]) .ui5-slider-root:active .ui5-slider-handle:not(:focus){background:var(--_ui5_range_slider_handle_active_background);border:var(--_ui5_slider_handle_focus_border);box-shadow:none}:host([range-pressed]) .ui5-slider-progress:focus:after{border:none}:host([range-pressed]) .ui5-slider-handle [slider-icon]{display:var(--_ui5_range_slider_active_handle_icon_display)}.ui5-slider-root:not(.ui5-slider-root-phone) .ui5-slider-inner .ui5-slider-handle:focus,.ui5-slider-root:not(.ui5-slider-root-phone):focus .ui5-slider-inner .ui5-slider-handle{background:var(--_ui5_range_slider_handle_background_focus)}.ui5-slider-root:not(.ui5-slider-root-phone) .ui5-slider-inner .ui5-slider-handle:focus [slider-icon]{display:none}.ui5-slider-root:not(.ui5-slider-root-phone) .ui5-slider-progress:focus:before{display:var(--_ui5_range_slider_legacy_progress_focus_display);content:\"\";position:absolute;width:var(--_ui5_range_slider_focus_outline_width);border:var(--_ui5_slider_progress_outline);border-radius:var(--_ui5_range_slider_focus_outline_radius);top:var(--_ui5_slider_progress_outline_offset);height:var(--_ui5_slider_outer_height);box-sizing:border-box;left:var(--_ui5_slider_progress_outline_offset_left)}.ui5-slider-progress{position:relative}.ui5-slider-progress:focus:after{border:.125rem solid var(--sapContent_FocusColor);border-radius:.5rem;content:\"\";display:var(--_ui5_range_slider_progress_focus_display);position:absolute;top:var(--_ui5_range_slider_progress_focus_top);left:var(--_ui5_range_slider_progress_focus_left);padding:var(--_ui5_range_slider_progress_focus_padding);width:var(--_ui5_range_slider_progress_focus_width);height:var(--_ui5_range_slider_progress_focus_height);box-sizing:border-box}.ui5-slider-handle{background:var(--_ui5_range_slider_handle_background)}.ui5-slider-root:hover .ui5-slider-handle:not(:focus){background:var(--_ui5_range_slider_root_hover_handle_bg)}.ui5-slider-root:hover .ui5-slider-handle:not(:focus) [slider-icon]{display:var(--_ui5_range_slider_root_hover_handle_icon_display)}:host([range-pressed]) .ui5-slider-root:active .ui5-slider-handle:not(:focus) [slider-icon]{display:var(--_ui5_range_slider_root_active_handle_icon_display)}"
  };
  _exports.default = _default;
});