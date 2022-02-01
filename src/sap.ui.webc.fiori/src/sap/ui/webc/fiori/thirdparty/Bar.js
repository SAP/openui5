sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', './generated/templates/BarTemplate.lit', './types/BarDesign', './generated/themes/Bar.css'], function (UI5Element, litRender, ResizeHandler, BarTemplate_lit, BarDesign, Bar_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);

	const metadata = {
		tag: "ui5-bar",
		managedSlots: true,
		fastNavigation: true,
		properties:  {
			design: {
				type: BarDesign,
				defaultValue: BarDesign.Header,
			},
			_shrinked: {
				type: Boolean,
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
		constructor() {
			super();
			this._handleResizeBound = this.handleResize.bind(this);
		}
		handleResize() {
			const bar = this.getDomRef();
			const barWidth = bar.offsetWidth;
			this._shrinked = Array.from(bar.children).some(element => {
				return barWidth / 3 < element.offsetWidth;
			});
		}
		get classes() {
			return {
				root: {
					"ui5-bar-root": true,
					"ui5-bar-root-shrinked": this._shrinked,
				},
			};
		}
		onBeforeRendering() {
			[...this.startContent, ...this.middleContent, ...this.endContent].forEach(element => element.classList.add("ui5-bar-content"));
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._handleResizeBound);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._handleResizeBound);
		}
	}
	Bar.define();

	return Bar;

});
