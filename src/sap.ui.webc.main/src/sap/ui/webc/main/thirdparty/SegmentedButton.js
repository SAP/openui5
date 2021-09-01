sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/Render', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/Keys', './generated/i18n/i18n-defaults', './SegmentedButtonItem', './generated/templates/SegmentedButtonTemplate.lit', './generated/themes/SegmentedButton.css'], function (UI5Element, ItemNavigation, litRender, i18nBundle, ResizeHandler, Render, Device, Keys, i18nDefaults, SegmentedButtonItem, SegmentedButtonTemplate_lit, SegmentedButton_css) { 'use strict';

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
				propertyName: "items",
				type: HTMLElement,
			},
		},
		events:  {
			"selection-change": {
				detail: {
					selectedItem: { type: HTMLElement },
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
			return [SegmentedButtonItem];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		constructor() {
			super();
			this._itemNavigation = new ItemNavigation__default(this, {
				getItemsCallback: () => this.getSlottedNodes("items"),
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
			if (this.parentNode) {
				ResizeHandler__default.deregister(this.parentNode, this._handleResizeBound);
			}
		}
		onBeforeRendering() {
			const items = this.getSlottedNodes("items");
			items.forEach((item, index, arr) => {
				item.posInSet = index + 1;
				item.sizeOfSet = arr.length;
			});
			this.normalizeSelection();
		}
		async onAfterRendering() {
			await this._doLayout();
		}
		prepareToMeasureItems() {
			this.style.width = "";
			this.items.forEach(item => {
				item.style.width = "";
			});
		}
		async measureItemsWidth() {
			await Render.renderFinished();
			this.prepareToMeasureItems();
			this.widths = this.items.map(item => {
				let width = item.offsetWidth + 1;
				if (Device.isIE()) {
					width += 1;
				}
				return width;
			});
		}
		normalizeSelection() {
			this._selectedItem = this.items.filter(item => item.pressed).pop();
			if (this._selectedItem) {
				this.items.forEach(item => {
					item.pressed = false;
				});
				this._selectedItem.pressed = true;
			}
		}
		_selectItem(event) {
			if (event.target.disabled || event.target === this.getDomRef()) {
				return;
			}
			if (event.target !== this._selectedItem) {
				if (this._selectedItem) {
					this._selectedItem.pressed = false;
				}
				this._selectedItem = event.target;
				this.fireEvent("selection-change", {
					selectedItem: this._selectedItem,
				});
			}
			this._selectedItem.pressed = true;
			this._itemNavigation.setCurrentItem(this._selectedItem);
			return this;
		}
		_onclick(event) {
			this._selectItem(event);
		}
		_onkeydown(event) {
			if (Keys.isEnter(event)) {
				this._selectItem(event);
			} else if (Keys.isSpace(event)) {
				event.preventDefault();
			}
		}
		_onkeyup(event) {
			if (Keys.isSpace(event)) {
				this._selectItem(event);
			}
		}
		_onfocusin(event) {
			if (this.hasPreviouslyFocusedItem) {
				this._itemNavigation.setCurrentItem(event.target);
				return;
			}
			if (this.selectedItem) {
				this.selectedItem.focus();
				this._itemNavigation.setCurrentItem(this._selectedItem);
				this.hasPreviouslyFocusedItem = true;
			}
		}
		async _doLayout() {
			const itemsHaveWidth = this.widths && this.widths.some(item => item.offsetWidth > 2);
			if (!itemsHaveWidth) {
				await this.measureItemsWidth();
			}
			const parentWidth = this.parentNode ? this.parentNode.offsetWidth : 0;
			if (!this.style.width || this.percentageWidthSet) {
				this.style.width = `${Math.max(...this.widths) * this.items.length}px`;
				this.absoluteWidthSet = true;
			}
			this.items.forEach(item => {
				item.style.width = "100%";
			});
			if (parentWidth <= this.offsetWidth && this.absoluteWidthSet) {
				this.style.width = "100%";
				this.percentageWidthSet = true;
			}
		}
		get selectedItem() {
			return this._selectedItem;
		}
		get ariaDescribedBy() {
			return this.i18nBundle.getText(i18nDefaults.SEGMENTEDBUTTON_ARIA_DESCRIBEDBY);
		}
		get ariaDescription() {
			return this.i18nBundle.getText(i18nDefaults.SEGMENTEDBUTTON_ARIA_DESCRIPTION);
		}
	}
	SegmentedButton.define();

	return SegmentedButton;

});
