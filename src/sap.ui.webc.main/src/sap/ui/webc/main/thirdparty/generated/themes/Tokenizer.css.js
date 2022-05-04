sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var styles = {packageName:"@ui5/webcomponents",fileName:"themes/Tokenizer.css",content:":host{display:inline-block;box-sizing:border-box;border:1px solid #000;height:2.25rem}.ui5-hidden-text{width:1px;overflow:hidden;color:transparent}.ui5-tokenizer-root{height:100%;display:flex;align-items:center;overflow-x:scroll;box-sizing:border-box;font-family:\"72override\",var(--sapFontFamily)}.ui5-tokenizer-no-padding{padding:0}.ui5-tokenizer-root.ui5-tokenizer-nmore--wrapper{overflow:hidden}.ui5-tokenizer--token--wrapper{display:inline-flex;align-items:center;box-sizing:border-box;height:100%}:host([expanded]) .ui5-tokenizer--content{display:inline-block;white-space:nowrap}.ui5-tokenizer--content{display:flex;flex-wrap:nowrap;align-items:center;overflow:auto;padding-left:var(--_ui5_tokenizer_padding)}.ui5-tokenizer--content.ui5-tokenizer-nmore--content{overflow:hidden}.ui5-tokenizer-more-text{display:inline-block;margin-left:.25rem;cursor:pointer;white-space:nowrap;font-size:var(--sapFontSize);font-weight:400;color:var(--sapField_TextColor)}:host([expanded]) .ui5-tokenizer--content{overflow:hidden;justify-content:flex-end}[dir=rtl] .ui5-tokenizer-more-text{margin-right:.25rem;margin-left:0}[dir=rtl] .ui5-tokenizer--content{padding-right:var(--_ui5_tokenizer_padding);padding-left:0}[dir=rtl] ::slotted([ui5-token]){margin-left:var(--_ui5_token_right_margin);margin-right:0}"};

	return styles;

});
