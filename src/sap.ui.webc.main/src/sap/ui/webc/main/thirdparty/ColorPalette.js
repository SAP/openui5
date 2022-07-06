sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/types/CSSColor', 'sap/ui/webc/common/thirdparty/base/types/ItemNavigationBehavior', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/FeaturesRegistry', './generated/templates/ColorPaletteTemplate.lit', './generated/templates/ColorPaletteDialogTemplate.lit', './ColorPaletteItem', './Button', './generated/i18n/i18n-defaults', './generated/themes/ColorPalette.css', './generated/themes/ColorPaletteStaticArea.css'], function (UI5Element, litRender, i18nBundle, ItemNavigation, CSSColor, ItemNavigationBehavior, Device, Keys, FeaturesRegistry, ColorPaletteTemplate_lit, ColorPaletteDialogTemplate_lit, ColorPaletteItem, Button, i18nDefaults, ColorPalette_css, ColorPaletteStaticArea_css) { 'use strict';

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
			showDefaultColor: {
				type: Boolean,
			},
			defaultColor: {
				type: CSSColor__default,
			},
			_selectedColor: {
				type: CSSColor__default,
			},
			popupMode: {
				type: Boolean,
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
				detail: {
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
			return [ColorPaletteItem, Button].concat(ColorPaletteMoreColors ? ColorPaletteMoreColors.dependencies : []);
		}
		static async onDefine() {
			const ColorPaletteMoreColors = FeaturesRegistry.getFeature("ColorPaletteMoreColors");
			[ColorPalette.i18nBundle] = await Promise.all([
				i18nBundle.getI18nBundle("@ui5/webcomponents"),
				ColorPaletteMoreColors ? ColorPaletteMoreColors.init() : Promise.resolve(),
			]);
		}
		constructor() {
			super();
			this._itemNavigation = new ItemNavigation__default(this, {
				getItemsCallback: () => this.displayedColors,
				rowSize: this.rowSize,
				behavior: ItemNavigationBehavior__default.Cyclic,
			});
			this._itemNavigationRecentColors = new ItemNavigation__default(this, {
				getItemsCallback: () => this.recentColorsElements,
				rowSize: this.rowSize,
				behavior: ItemNavigationBehavior__default.Static,
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
			if (!item.value) {
				return;
			}
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
			if (event.target.hasAttribute("ui5-color-palette-item")) {
				this.selectColor(event.target);
			}
		}
		_onkeyup(event) {
			if (Keys.isSpace(event) && event.target.hasAttribute("ui5-color-palette-item")) {
				event.preventDefault();
				this.selectColor(event.target);
			}
		}
		_onkeydown(event) {
			if (Keys.isEnter(event) && event.target.hasAttribute("ui5-color-palette-item")) {
				this.selectColor(event.target);
			}
		}
		_onDefaultColorKeyDown(event) {
			if (Keys.isTabNext(event) && this.popupMode) {
				event.preventDefault();
				this._onDefaultColorClick();
			}
			if (Keys.isDown(event)) {
				event.stopPropagation();
				this.focusColorElement(this.colorPaletteNavigationElements[1], this._itemNavigation);
			} else if (Keys.isUp(event)) {
				event.stopPropagation();
				const lastElementInNavigation = this.colorPaletteNavigationElements[this.colorPaletteNavigationElements.length - 1];
				if (this.hasRecentColors) {
					this.focusColorElement(lastElementInNavigation, this._itemNavigationRecentColors);
				} else if (this.showMoreColors) {
					lastElementInNavigation.focus();
				} else {
					const colorPaletteFocusIndex = (this.displayedColors.length % this.rowSize) * this.rowSize;
					this.focusColorElement(this.displayedColors[colorPaletteFocusIndex], this._itemNavigation);
				}
			}
		}
		_onMoreColorsKeyDown(event) {
			const index = this.colorPaletteNavigationElements.indexOf(event.target);
			const colorPaletteFocusIndex = (this.displayedColors.length % this.rowSize) * this.rowSize;
			if (Keys.isUp(event)) {
				event.stopPropagation();
				this.focusColorElement(this.displayedColors[colorPaletteFocusIndex], this._itemNavigation);
			} else if (Keys.isDown(event)) {
				event.stopPropagation();
				if (this.hasRecentColors) {
					this.focusColorElement(this.colorPaletteNavigationElements[index + 1], this._itemNavigationRecentColors);
				} else if (this.showDefaultColor) {
					this.colorPaletteNavigationElements[0].focus();
				} else {
					this.focusColorElement(this.displayedColors[0], this._itemNavigation);
				}
			}
		}
		_onColorContainerKeyDown(event) {
			const lastElementInNavigation = this.colorPaletteNavigationElements[this.colorPaletteNavigationElements.length - 1];
			if (Keys.isTabNext(event) && this.popupMode) {
				event.preventDefault();
				this.selectColor(event.target);
			}
			if (Keys.isUp(event) && event.target === this.displayedColors[0] && this.colorPaletteNavigationElements.length > 1) {
				event.stopPropagation();
				if (this.showDefaultColor) {
					this.colorPaletteNavigationElements[0].focus();
				} else if (!this.showDefaultColor && this.hasRecentColors) {
					this.focusColorElement(lastElementInNavigation, this._itemNavigationRecentColors);
				} else if (!this.showDefaultColor && this.showMoreColors) {
					lastElementInNavigation.focus();
				}
			} else if (Keys.isDown(event) && event.target === this.displayedColors[this.displayedColors.length - 1] && this.colorPaletteNavigationElements.length > 1) {
				event.stopPropagation();
				const isRecentColorsNextElement = (this.showDefaultColor && !this.showMoreColors && this.hasRecentColors) || (!this.showDefaultColor && !this.showMoreColors && this.hasRecentColors);
				if (this.showDefaultColor && this.showMoreColors) {
					this.colorPaletteNavigationElements[2].focus();
				} else if (this.showDefaultColor && !this.showMoreColors && (!this.showRecentColors || !this.recentColors[0])) {
					this.colorPaletteNavigationElements[0].focus();
				} else if (isRecentColorsNextElement) {
					this.focusColorElement(lastElementInNavigation, this._itemNavigationRecentColors);
				} else if (!this.showDefaultColor && this.showMoreColors) {
					this.colorPaletteNavigationElements[1].focus();
				}
			}
		}
		_onRecentColorsContainerKeyDown(event) {
			if (Keys.isUp(event)) {
				if (this.showMoreColors) {
					this.colorPaletteNavigationElements[1 + this.showDefaultColor].focus();
				} else if (!this.showMoreColors && this.colorPaletteNavigationElements.length > 1) {
					const colorPaletteFocusIndex = (this.displayedColors.length % this.rowSize) * this.rowSize;
					event.stopPropagation();
					this.focusColorElement(this.displayedColors[colorPaletteFocusIndex], this._itemNavigation);
				}
			} else if (Keys.isDown(event)) {
				if (this.showDefaultColor) {
					this.colorPaletteNavigationElements[0].focus();
				} else {
					event.stopPropagation();
					this.focusColorElement(this.displayedColors[0], this._itemNavigation);
				}
			}
		}
		focusColorElement(element, itemNavigation) {
			itemNavigation.setCurrentItem(element);
			itemNavigation._focusCurrentItem();
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
		_onDefaultColorClick() {
			if (this.defaultColor) {
				this._setColor(this.defaultColor);
			}
		}
		get selectedColor() {
			return this._selectedColor;
		}
		get displayedColors() {
			return this.getSlottedNodes("colors").filter(item => item.value).slice(0, 15);
		}
		get colorContainerLabel() {
			return ColorPalette.i18nBundle.getText(i18nDefaults.COLORPALETTE_CONTAINER_LABEL);
		}
		get colorPaleteMoreColorsText() {
			return ColorPalette.i18nBundle.getText(i18nDefaults.COLOR_PALETTE_MORE_COLORS_TEXT);
		}
		get _showMoreColors() {
			return this.showMoreColors && this.moreColorsFeature;
		}
		get rowSize() {
			return 5;
		}
		get hasRecentColors() {
			return this.showRecentColors && this.recentColors[0];
		}
		get recentColors() {
			if (this._recentColors.length > this.rowSize) {
				this._recentColors = this._recentColors.slice(0, this.rowSize);
			}
			while (this._recentColors.length < this.rowSize) {
				this._recentColors.push("");
			}
			return this._recentColors;
		}
		get recentColorsElements() {
			if (this.getDomRef()) {
				return Array.from(this.getDomRef().querySelectorAll(".ui5-cp-recent-colors-wrapper [ui5-color-palette-item]")).filter(x => x.value !== "");
			}
			return [];
		}
		get colorPaletteNavigationElements() {
			const navigationElements = [];
			const rootElement = this.shadowRoot.querySelector(".ui5-cp-root");
			if (this.showDefaultColor) {
				navigationElements.push(rootElement.querySelector(".ui5-cp-default-color-button"));
			}
			navigationElements.push(this.displayedColors[0]);
			if (this.showMoreColors) {
				navigationElements.push(rootElement.querySelector(".ui5-cp-more-colors"));
			}
			if (this.showRecentColors && !!this.recentColorsElements.length) {
				navigationElements.push(this.recentColorsElements[0]);
			}
			return navigationElements;
		}
		get classes() {
			return {
				colorPaletteRoot: {
					"ui5-cp-root": true,
					"ui5-cp-root-phone": Device.isPhone(),
				},
			};
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
