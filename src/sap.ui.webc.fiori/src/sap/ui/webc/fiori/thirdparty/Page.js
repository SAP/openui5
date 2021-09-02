sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/MediaRange', './types/PageBackgroundDesign', './generated/templates/PageTemplate.lit', './generated/themes/Page.css'], function (UI5Element, litRender, ResizeHandler, MediaRange, PageBackgroundDesign, PageTemplate_lit, Page_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var MediaRange__default = /*#__PURE__*/_interopDefaultLegacy(MediaRange);

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
			mediaRange: {
				type: String,
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
		constructor() {
			super();
			this._updateMediaRange = this.updateMediaRange.bind(this);
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._updateMediaRange);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._updateMediaRange);
		}
		updateMediaRange() {
			this.mediaRange = MediaRange__default.getCurrentRange(MediaRange__default.RANGESETS.RANGE_4STEPS, this.getDomRef().offsetWidth);
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
				footer: {},
			};
		}
	}
	Page.define();

	return Page;

});
