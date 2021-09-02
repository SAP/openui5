sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var styles = ":host{display:inline-block;box-sizing:border-box;border:1px solid #000;height:2.25rem}.ui5-hidden-text{width:1px;overflow:hidden;color:transparent}.ui5-tokenizer-root{height:100%;display:flex;align-items:center;padding:var(--_ui5_tokenizer_root_padding);overflow-x:scroll;box-sizing:border-box;font-family:\"72override\",var(--sapFontFamily)}.ui5-tokenizer-no-padding{padding:0}.ui5-tokenizer-root.ui5-tokenizer-nmore--wrapper{overflow-x:hidden}.ui5-tokenizer--token--wrapper{display:inline-flex;align-items:center;box-sizing:border-box;height:100%}:host([expanded]) .ui5-tokenizer--content{display:inline-block;white-space:nowrap}.ui5-tokenizer--content{display:flex;flex-wrap:nowrap;align-items:center;overflow:auto}.ui5-tokenizer--content.ui5-tokenizer-nmore--content{overflow:hidden}.ui5-tokenizer-more-text{display:inline-block;margin-left:.25rem;cursor:pointer;white-space:nowrap;font-size:var(--sapFontSize)}:host([expanded]) .ui5-tokenizer--content{overflow:hidden;justify-content:flex-end}::slotted([ui5-token]){margin-left:.25rem}[dir=rtl] .ui5-tokenizer-more-text{margin-right:.25rem;margin-left:0}[dir=rtl] ::slotted([ui5-token]){margin-right:.25rem;margin-left:0}";

	return styles;

});
