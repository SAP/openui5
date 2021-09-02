sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/types/CSSColor', './generated/templates/ColorPaletteItemTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/ColorPaletteItem.css'], function (UI5Element, litRender, i18nBundle, CSSColor, ColorPaletteItemTemplate_lit, i18nDefaults, ColorPaletteItem_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var CSSColor__default = /*#__PURE__*/_interopDefaultLegacy(CSSColor);

	const metadata = {
		tag: "ui5-color-palette-item",
		managedSlots: true,
		properties:  {
			value: {
				type: CSSColor__default,
			},
			_tabIndex: {
				type: String,
				defaultValue: "-1",
				noAttribute: true,
			},
			index: {
				type: String,
			},
			_disabled: {
				type: Boolean,
			},
		},
		slots:  {
		},
		events:  {
		},
	};
	class ColorPaletteItem extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return ColorPaletteItem_css;
		}
		static get template() {
			return ColorPaletteItemTemplate_lit;
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		onBeforeRendering() {
			this._disabled = !this.value;
		}
		get colorLabel() {
			return this.i18nBundle.getText(i18nDefaults.COLORPALETTE_COLOR_LABEL);
		}
	}
	ColorPaletteItem.define();

	return ColorPaletteItem;

});
