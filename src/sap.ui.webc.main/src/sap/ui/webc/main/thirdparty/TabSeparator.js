sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/renderer/executeTemplate', './TabContainer', './generated/templates/TabSeparatorInStripTemplate.lit', './generated/templates/TabSeparatorInOverflowTemplate.lit', './generated/themes/TabSeparatorInStrip.css', './generated/themes/TabSeparatorInOverflow.css'], function (UI5Element, litRender, executeTemplate, TabContainer, TabSeparatorInStripTemplate_lit, TabSeparatorInOverflowTemplate_lit, TabSeparatorInStrip_css, TabSeparatorInOverflow_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var executeTemplate__default = /*#__PURE__*/_interopDefaultLegacy(executeTemplate);

	const metadata = {
		tag: "ui5-tab-separator",
	};
	class TabSeparator extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get stripTemplate() {
			return TabSeparatorInStripTemplate_lit;
		}
		static get overflowTemplate() {
			return TabSeparatorInOverflowTemplate_lit;
		}
		get classes() {
			return {
				"ui5-tc__separator": true,
			};
		}
		get isSeparator() {
			return true;
		}
		getTabInStripDomRef() {
			return this._tabInStripDomRef;
		}
		get stableDomRef() {
			return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
		}
		get stripPresentation() {
			return executeTemplate__default(this.constructor.stripTemplate, this);
		}
		get overflowPresentation() {
			return executeTemplate__default(this.constructor.overflowTemplate, this);
		}
	}
	TabSeparator.define();
	TabContainer.registerTabStyles(TabSeparatorInStrip_css);
	TabContainer.registerStaticAreaTabStyles(TabSeparatorInOverflow_css);

	return TabSeparator;

});
