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
    fileName: "themes/Tokenizer.css",
    content: ".ui5-hidden-text {\n\tposition: absolute;\n\tclip: rect(1px,1px,1px,1px);\n\tuser-select: none;\n\tleft: -1000px; /* ensure the invisible texts are never part of the viewport */\n\ttop: -1000px;\n\tpointer-events: none;\n\tfont-size: 0;\n}\n\n:host {\n\tdisplay: inline-block;\n\tbox-sizing: border-box;\n\tborder: 1px solid black;\n\theight: 2.25rem;\n}\n\n.ui5-tokenizer-root {\n\theight: 100%;\n\tdisplay: flex;\n\talign-items: center;\n\toverflow-x: scroll;\n\tbox-sizing: border-box;\n\tfont-family: \"72override\", var(--sapFontFamily);\n}\n\n.ui5-tokenizer-no-padding {\n\tpadding: 0;\n}\n\n.ui5-tokenizer-root.ui5-tokenizer-nmore--wrapper {\n\toverflow: hidden;\n}\n\n.ui5-tokenizer--token--wrapper {\n\tdisplay: inline-flex;\n\talign-items: center;\n\tbox-sizing: border-box;\n\theight: 100%;\n}\n\n:host([expanded]) .ui5-tokenizer--content {\n\tdisplay: inline-block;\n\twhite-space: nowrap;\n}\n\n.ui5-tokenizer--content {\n\tdisplay: flex;\n\tflex-wrap: nowrap;\n\talign-items: center;\n\toverflow: hidden;\n\tpadding-inline-start: var(--_ui5_tokenizer_padding);\n}\n\n.ui5-tokenizer-more-text {\n\tdisplay: inline-block;\n\tmargin-inline-start: .25rem;\n\tcursor: pointer;\n\twhite-space: nowrap;\n\tfont-size: var(--sapFontSize);\n\tfont-weight: normal;\n\tcolor: var(--_ui5_tokenizer_n_more_text_color);\n}\n\n:host([expanded]) .ui5-tokenizer--content {\n\toverflow: hidden;\n\tjustify-content: flex-end;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});