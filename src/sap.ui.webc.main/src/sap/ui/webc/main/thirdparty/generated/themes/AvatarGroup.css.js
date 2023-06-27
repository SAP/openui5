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
    fileName: "themes/AvatarGroup.css",
    content: ":host {\n\t-webkit-tap-highlight-color: rgba(0,0,0,0);\n}\n\n:host(:not([hidden])) {\n\tdisplay: block;\n\twidth: 100%;\n}\n\n:host {\n\t--_ui5_button_focused_border: var(--_ui5_avatar_group_button_focus_border);\n}\n\n.ui5-avatar-group-items:focus {\n\toutline: none;\n}\n\n:host([type=\"Group\"]) .ui5-avatar-group-items:focus {\n\toutline: var(--_ui5_avatar_outline);\n\toutline-offset: var(--_ui5_avatar_focus_offset);\n\tborder-radius: var(--_ui5_avatar_group_focus_border_radius);\n}\n\n.ui5-avatar-group-root {\n\tdisplay: flex;\n}\n\n.ui5-avatar-group-items {\n\twhite-space: nowrap;\n\tposition: relative;\n\tdisplay: inline-flex;\n}\n\n:host([type=\"Group\"]) .ui5-avatar-group-items {\n\tcursor: pointer;\n}\n\n:host([type=\"Group\"]) ::slotted([ui5-button]),\n:host([type=\"Group\"]) ::slotted([ui5-avatar]) {\n\tpointer-events: none;\n}\n\n::slotted([ui5-button]:not([hidden])),\n.ui5-avatar-group-overflow-btn:not([hidden]) {\n\t--_ui5_button_base_padding: 0;\n\tborder-radius: 50%;\n\tdisplay: inline-flex;\n\ttext-overflow: initial;\n\tz-index: 0; /* prevent last visible avatar from covering half of the button */\n}\n\n::slotted([ui5-button][focused]),\n.ui5-avatar-group-overflow-btn[focused] {\n\toutline: var(--_ui5_avatar_outline);\n\toutline-offset: var(--_ui5_avatar_focus_offset);\n}\n\n.ui5-avatar-group-overflow-btn.ui5-avatar-group-overflow-btn-xs {\n\theight: 2rem;\n\twidth: 2rem;\n\tmin-width: 2rem;\n\tfont-size: .75rem;\n}\n\n::slotted([ui5-button]),\n.ui5-avatar-group-overflow-btn.ui5-avatar-group-overflow-btn-s {\n\theight: 3rem;\n\twidth: 3rem;\n\tmin-width: 3rem;\n\tfont-size: 1.125rem;\n}\n\n.ui5-avatar-group-overflow-btn.ui5-avatar-group-overflow-btn-m {\n\theight: 4rem;\n\twidth: 4rem;\n\tmin-width: 4rem;\n\tfont-size: 1.625rem;\n}\n\n.ui5-avatar-group-overflow-btn.ui5-avatar-group-overflow-btn-l {\n\theight: 5rem;\n\twidth: 5rem;\n\tmin-width: 5rem;\n\tfont-size: 2rem;\n}\n\n.ui5-avatar-group-overflow-btn.ui5-avatar-group-overflow-btn-xl {\n\theight: 7rem;\n\twidth: 7rem;\n\tmin-width: 7rem;\n\tfont-size: 2.75rem;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});