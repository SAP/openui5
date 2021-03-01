sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', './types/PageBackgroundDesign', './generated/templates/PageTemplate.lit', './generated/themes/Page.css'], function (UI5Element, litRender, PageBackgroundDesign, PageTemplate_lit, Page_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-page",
		managedSlots: true,
		languageAware: true,
		properties:  {
			backgroundDesign: {
				type: String,
				defaultValue: PageBackgroundDesign.Solid,
			},
			disableScrolling: {
				type: Boolean,
			},
			floatingFooter: {
				type: Boolean,
			},
			hideFooter: {
				type: Boolean,
			},
		},
		slots:  {
			header: {
				type: HTMLElement,
			},
			"default": {
				propertyName: "content",
				type: HTMLElement,
			},
			footer: {
				type: HTMLElement,
			},
		},
		events:  {
		},
	};
	class Page extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return Page_css;
		}
		static get template() {
			return PageTemplate_lit;
		}
		get _contentBottom() {
			return !this.floatingFooter && !this.hideFooter ? "2.75rem" : "0";
		}
		get _contentPaddingBottom() {
			return this.floatingFooter && !this.hideFooter ? "3.5rem" : "0";
		}
		get _contentTop() {
			return this.header.length ? "2.75rem" : "0rem";
		}
		get styles() {
			return {
				content: {
					"padding-bottom": this.footer.length && this._contentPaddingBottom,
					"bottom": this.footer.length && this._contentBottom,
					"top": this._contentTop,
				},
			};
		}
	}
	Page.define();

	return Page;

});
