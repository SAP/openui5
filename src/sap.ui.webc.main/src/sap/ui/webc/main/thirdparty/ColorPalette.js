sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/types/CSSColor', 'sap/ui/webc/common/thirdparty/base/types/ItemNavigationBehavior', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/FeaturesRegistry', './generated/templates/ColorPaletteTemplate.lit', './generated/templates/ColorPaletteDialogTemplate.lit', './ColorPaletteItem', './generated/i18n/i18n-defaults', './generated/themes/ColorPalette.css', './generated/themes/ColorPaletteStaticArea.css'], function (UI5Element, litRender, i18nBundle, ItemNavigation, CSSColor, ItemNavigationBehavior, Keys, FeaturesRegistry, ColorPaletteTemplate_lit, ColorPaletteDialogTemplate_lit, ColorPaletteItem, i18nDefaults, ColorPalette_css, ColorPaletteStaticArea_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);
	var CSSColor__default = /*#__PURE__*/_interopDefaultLegacy(CSSColor);
	var ItemNavigationBehavior__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigationBehavior);

	const metadata = {
		tag: "ui5-color-palette",
		managedSlots: true,
		properties:  {
			showRecentColors: {
				type: Boolean,
			},
			showMoreColors: {
				type: Boolean,
			},
			_selectedColor: {
				type: CSSColor__default,
			},
		},
		slots:  {
			"default": {
				propertyName: "colors",
				type: HTMLElement,
				invalidateOnChildChange: true,
				individualSlots: true,
			},
		},
		events:  {
			"item-click": {
				details: {
					color: {
						type: String,
					},
				},
			 },
		},
	};
	class ColorPalette extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return ColorPalette_css;
		}
		static get staticAreaStyles() {
			return ColorPaletteStaticArea_css;
		}
		static get template() {
			return ColorPaletteTemplate_lit;
		}
		static get staticAreaTemplate() {
			return ColorPaletteDialogTemplate_lit;
		}
		static get dependencies() {
			const ColorPaletteMoreColors = FeaturesRegistry.getFeature("ColorPaletteMoreColors");
			return [ColorPaletteItem].concat(ColorPaletteMoreColors ? ColorPaletteMoreColors.dependencies : []);
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
			this._itemNavigation = new ItemNavigation__default(this, {
				getItemsCallback: () => this.displayedColors,
				rowSize: 5,
				behavior: ItemNavigationBehavior__default.Cyclic,
			});
			this._recentColors = [];
		}
		onBeforeRendering() {
			this.displayedColors.forEach((item, index) => {
				item.index = index + 1;
			});
			if (this.showMoreColors) {
				const ColorPaletteMoreColors = FeaturesRegistry.getFeature("ColorPaletteMoreColors");
				if (ColorPaletteMoreColors) {
					this.moreColorsFeature = new ColorPaletteMoreColors();
				} else {
					throw new Error(`You have to import "@ui5/webcomponents/dist/features/ColorPaletteMoreColors.js" module to use the more-colors functionality.`);
				}
			}
		}
		selectColor(item) {
			item.focus();
			if (this.displayedColors.includes(item)) {
				this._itemNavigation.setCurrentItem(item);
			}
			this._setColor(item.value);
		}
		_setColor(color) {
			this._selectedColor = color;
			if (this._recentColors[0] !== this._selectedColor) {
				if (this._recentColors.includes(this._selectedColor)) {
					this._recentColors.unshift(this._recentColors.splice(this._recentColors.indexOf(this._selectedColor), 1)[0]);
				} else {
					this._recentColors.unshift(this._selectedColor);
				}
			}
			this.fireEvent("item-click", {
				color: this._selectedColor,
			});
		}
		_onclick(event) {
			if (event.target.localName === "ui5-color-palette-item") {
				this.selectColor(event.target);
			}
		}
		_onkeyup(event) {
			if (Keys.isSpace(event)) {
				event.preventDefault();
				this.selectColor(event.target);
			}
		}
		_onkeydown(event) {
			if (Keys.isEnter(event)) {
				this.selectColor(event.target);
			}
		}
		async _chooseCustomColor() {
			const colorPicker = await this.getColorPicker();
			this._setColor(colorPicker.color);
			this._closeDialog();
		}
		async _closeDialog() {
			const dialog = await this._getDialog();
			dialog.close();
		}
		async _openMoreColorsDialog() {
			const dialog = await this._getDialog();
			dialog.show();
		}
		get selectedColor() {
			return this._selectedColor;
		}
		get displayedColors() {
			return this.colors.filter(item => item.value).slice(0, 15);
		}
		get colorContainerLabel() {
			return this.i18nBundle.getText(i18nDefaults.COLORPALETTE_CONTAINER_LABEL);
		}
		get colorPaleteMoreColorsText() {
			return this.i18nBundle.getText(i18nDefaults.COLOR_PALETTE_MORE_COLORS_TEXT);
		}
		get _showMoreColors() {
			return this.showMoreColors && this.moreColorsFeature;
		}
		get recentColors() {
			if (this._recentColors.length > 5) {
				this._recentColors = this._recentColors.slice(0, 5);
			}
			while (this._recentColors.length < 5) {
				this._recentColors.push("");
			}
			return this._recentColors;
		}
		async _getDialog() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector("[ui5-dialog]");
		}
		async getColorPicker() {
			const dialog = await this._getDialog();
			return dialog.content[0].querySelector("[ui5-color-picker]");
		}
	}
	ColorPalette.define();

	return ColorPalette;

});
