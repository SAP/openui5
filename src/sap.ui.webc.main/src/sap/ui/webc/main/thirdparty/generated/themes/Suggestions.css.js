sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var SuggestionsCss = {packageName:"@ui5/webcomponents",fileName:"themes/Suggestions.css",content:".ui5-suggestions-popover{box-shadow:var(--sapContent_Shadow1)}.ui5-suggestions-popover:not(.ui5-suggestions-popover-with-value-state-header) [ui5-li-groupheader][focused]:first-child::part(native-li):after,.ui5-suggestions-popover:not(.ui5-suggestions-popover-with-value-state-header) [ui5-li-suggestion-item][focused]:first-child::part(native-li):after,.ui5-suggestions-popover:not(.ui5-suggestions-popover-with-value-state-header) [ui5-li][focused]:first-child::part(native-li):after,.ui5-tokenizer-list [ui5-li][focused]:first-child::part(native-li):after{border-top-left-radius:var(--_ui5_suggestions_item_focus_border_radius);border-top-right-radius:var(--_ui5_suggestions_item_focus_border_radius)}.ui5-suggestions-popover [ui5-li-suggestion-item][focused]:last-child::part(native-li):after,.ui5-suggestions-popover [ui5-li][focused]:last-child::part(native-li):after,.ui5-tokenizer-list [ui5-li][focused]:last-child::part(native-li):after{border-bottom-left-radius:var(--_ui5_suggestions_item_focus_border_radius);border-bottom-right-radius:var(--_ui5_suggestions_item_focus_border_radius)}.ui5-suggestions-popover::part(content),.ui5-suggestions-popover::part(header){padding:0}.ui5-suggestions-popover::part(footer){padding:0 1rem}.ui5-suggestions-popover [ui5-li-suggestion-item],.ui5-suggestions-popover [ui5-li]{height:var(--_ui5_list_item_dropdown_base_height)}"};

	return SuggestionsCss;

});
