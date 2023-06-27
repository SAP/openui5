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
    fileName: "themes/NotificationListItemBase.css",
    content: ".ui5-hidden-text {\n\tposition: absolute;\n\tclip: rect(1px,1px,1px,1px);\n\tuser-select: none;\n\tleft: -1000px; /* ensure the invisible texts are never part of the viewport */\n\ttop: -1000px;\n\tpointer-events: none;\n\tfont-size: 0;\n}\n\n:host(:not([hidden])) {\n\tdisplay: block;\n\twidth: 100%;\n\tmin-height: var(--_ui5_list_item_base_height);\n\tbackground: var(--ui5-listitem-background-color);\n\tcursor: pointer;\n}\n\n:host([has-border]) {\n\tborder-bottom: var(--ui5-listitem-border-bottom);\n}\n\n:host([focused]) .ui5-nli-focusable {\n\toutline: none;\n}\n\n:host([focused]) .ui5-nli-focusable:after {\n\tcontent: \"\";\n\tborder: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);\n\tposition: absolute;\n\ttop: 0;\n\tright: 0;\n\tbottom: 0;\n\tleft: 0;\n\tpointer-events: none;\n}\n\n:host([busy])  {\n\topacity: 0.6;\n\tpointer-events: none;\n}\n\n:host([busy]) .ui5-nli-busy {\n\tposition: absolute;\n\ttop: 50%;\n\tleft: 50%;\n\ttransform: translate(-50%, -50%);\n}\n\n.ui5-nli-action {\n\tflex-shrink: 0;\n\tmargin-inline-end: 0.5rem;\n}\n\n.ui5-nli-overflow-btn {\n\tmargin-inline-end: 0.5rem;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});