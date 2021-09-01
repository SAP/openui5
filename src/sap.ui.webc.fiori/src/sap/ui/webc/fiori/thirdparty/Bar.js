sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', './generated/templates/BarTemplate.lit', './types/BarDesign', './generated/themes/Bar.css'], function (UI5Element, litRender, BarTemplate_lit, BarDesign, Bar_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-bar",
		managedSlots: true,
		properties:  {
			design: {
				type: BarDesign,
				defaultValue: BarDesign.Header,
			},
		},
		slots:  {
			startContent: {
				type: HTMLElement,
			},
			"default": {
				type: HTMLElement,
				propertyName: "middleContent",
			},
			endContent: {
				type: HTMLElement,
			},
		},
		events:  {
		},
	};
	class Bar extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return Bar_css;
		}
		static get template() {
			return BarTemplate_lit;
		}
		get accInfo() {
			return {
				"label": this.design,
			};
		}
	}
	Bar.define();

	return Bar;

});
