sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/types/CSSColor', './generated/templates/ColorPalettePopoverTemplate.lit', './generated/themes/ColorPalettePopover.css', './generated/themes/ResponsivePopoverCommon.css', './generated/i18n/i18n-defaults', './Button', './Title', './ResponsivePopover', './ColorPalette'], function (UI5Element, litRender, i18nBundle, CSSColor, ColorPalettePopoverTemplate_lit, ColorPalettePopover_css, ResponsivePopoverCommon_css, i18nDefaults, Button, Title, ResponsivePopover, ColorPalette) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var CSSColor__default = /*#__PURE__*/_interopDefaultLegacy(CSSColor);

	const metadata = {
		tag: "ui5-color-palette-popover",
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
		},
		slots:  {
			"default": {
				type: HTMLElement,
				propertyName: "colors",
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
	class ColorPalettePopover extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return [ResponsivePopoverCommon_css, ColorPalettePopover_css];
		}
		static get template() {
			return ColorPalettePopoverTemplate_lit;
		}
		static get dependencies() {
			return [
				ResponsivePopover,
				Button,
				Title,
				ColorPalette,
			];
		}
		static async onDefine() {
			ColorPalettePopover.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		constructor() {
			super();
		}
		_respPopover() {
			this.responsivePopover = this.shadowRoot.querySelector("[ui5-responsive-popover]");
			return this.responsivePopover;
		}
		_colorPalette() {
			return this.responsivePopover.content[0].querySelector("[ui5-color-palette]");
		}
		showAt(opener) {
			this._openPopover(opener);
		}
		openPopover(opener) {
			console.warn("The method 'openPopover' is deprecated and will be removed in future, use 'showAt' instead.");
			this._openPopover(opener);
		}
		_openPopover(opener) {
			this._respPopover();
			this.responsivePopover.showAt(opener, true);
			if (this.showDefaultColor) {
				this._colorPalette().colorPaletteNavigationElements[0].focus();
			} else {
				this._colorPalette().focusColorElement(this._colorPalette().colorPaletteNavigationElements[0], this._colorPalette()._itemNavigation);
			}
		}
		closePopover() {
			this.responsivePopover.close();
		}
		onSelectedColor(event) {
			this.closePopover();
			this.fireEvent("item-click", event.detail);
		}
		isOpen() {
			this._respPopover();
			return this.responsivePopover.opened;
		}
		get colorPaletteColors() {
			return this.getSlottedNodes("colors");
		}
		get _colorPaletteTitle() {
			return ColorPalettePopover.i18nBundle.getText(i18nDefaults.COLORPALETTE_POPOVER_TITLE);
		}
		get _cancelButtonLabel() {
			return ColorPalettePopover.i18nBundle.getText(i18nDefaults.COLOR_PALETTE_DIALOG_CANCEL_BUTTON);
		}
	}
	ColorPalettePopover.define();

	return ColorPalettePopover;

});
