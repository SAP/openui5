sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/Render', 'sap/ui/webc/common/thirdparty/base/Device', './generated/i18n/i18n-defaults', './ToggleButton', './generated/templates/SegmentedButtonTemplate.lit', './generated/themes/SegmentedButton.css'], function (UI5Element, ItemNavigation, litRender, i18nBundle, ResizeHandler, Render, Device, i18nDefaults, ToggleButton, SegmentedButtonTemplate_lit, SegmentedButton_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);

	const metadata = {
		tag: "ui5-segmented-button",
		altTag: "ui5-segmentedbutton",
		languageAware: true,
		properties:   {},
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "buttons",
				type: HTMLElement,
			},
		},
		events:  {
			"selection-change": {
				detail: {
					selectedButton: { type: HTMLElement },
				},
			},
		},
	};
	class SegmentedButton extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return SegmentedButtonTemplate_lit;
		}
		static get styles() {
			return SegmentedButton_css;
		}
		static get dependencies() {
			return [ToggleButton];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		constructor() {
			super();
			this._itemNavigation = new ItemNavigation__default(this, {
				getItemsCallback: () => this.getSlottedNodes("buttons"),
			});
			this.absoluteWidthSet = false;
			this.percentageWidthSet = false;
			this.hasPreviouslyFocusedItem = false;
			this._handleResizeBound = this._doLayout.bind(this);
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		onEnterDOM() {
			ResizeHandler__default.register(this.parentNode, this._handleResizeBound);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this.parentNode, this._handleResizeBound);
		}
		onBeforeRendering() {
			this.normalizeSelection();
		}
		async onAfterRendering() {
			await this._doLayout();
		}
		prepareToMeasureButtons() {
			this.style.width = "";
			this.buttons.forEach(button => {
				button.style.width = "";
			});
		}
		async measureButtonsWidth() {
			await Render.renderFinished();
			this.prepareToMeasureButtons();
			this.widths = this.buttons.map(button => {
				let width = button.offsetWidth + 1;
				if (Device.isIE()) {
					width += 1;
				}
				return width;
			});
		}
		normalizeSelection() {
			this._selectedButton = this.buttons.filter(button => button.pressed).pop();
			if (this._selectedButton) {
				this.buttons.forEach(button => {
					button.pressed = false;
				});
				this._selectedButton.pressed = true;
			}
		}
		_onclick(event) {
			if (event.target.disabled || event.target === this.getDomRef()) {
				return;
			}
			if (event.target !== this._selectedButton) {
				if (this._selectedButton) {
					this._selectedButton.pressed = false;
				}
				this._selectedButton = event.target;
				this.fireEvent("selection-change", {
					selectedButton: this._selectedButton,
				});
			}
			this._selectedButton.pressed = true;
			this._itemNavigation.setCurrentItem(this._selectedButton);
			return this;
		}
		_onfocusin(event) {
			if (this.hasPreviouslyFocusedItem) {
				this._itemNavigation.setCurrentItem(event.target);
				return;
			}
			if (this.selectedButton) {
				this.selectedButton.focus();
				this._itemNavigation.setCurrentItem(this._selectedButton);
				this.hasPreviouslyFocusedItem = true;
			}
		}
		async _doLayout() {
			const buttonsHaveWidth = this.widths && this.widths.some(button => button.offsetWidth > 2);
			if (!buttonsHaveWidth) {
				await this.measureButtonsWidth();
			}
			const parentWidth = this.parentNode.offsetWidth;
			if (!this.style.width || this.percentageWidthSet) {
				this.style.width = `${Math.max(...this.widths) * this.buttons.length}px`;
				this.absoluteWidthSet = true;
			}
			this.buttons.forEach(button => {
				button.style.width = "100%";
			});
			if (parentWidth <= this.offsetWidth && this.absoluteWidthSet) {
				this.style.width = "100%";
				this.percentageWidthSet = true;
			}
		}
		get selectedButton() {
			return this._selectedButton;
		}
		get ariaDescription() {
			return this.i18nBundle.getText(i18nDefaults.SEGMENTEDBUTTON_ARIA_DESCRIPTION);
		}
	}
	SegmentedButton.define();

	return SegmentedButton;

});
