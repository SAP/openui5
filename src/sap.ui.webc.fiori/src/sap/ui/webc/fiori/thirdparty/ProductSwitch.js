sap.ui.define(['sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', './generated/templates/ProductSwitchTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/ProductSwitch.css'], function (i18nBundle, UI5Element, ItemNavigation, ResizeHandler, Integer, litRender, Keys, ProductSwitchTemplate_lit, i18nDefaults, ProductSwitch_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-product-switch",
		properties:  {
			desktopColumns: {
				type: Integer__default,
			},
		},
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "items",
				type: HTMLElement,
			},
		},
	};
	class ProductSwitch extends UI5Element__default {
		constructor() {
			super();
			this._currentIndex = 0;
			this._rowSize = 4;
			this._itemNavigation = new ItemNavigation__default(this, {
				rowSize: this._rowSize,
				getItemsCallback: () => this.items,
			});
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return ProductSwitch_css;
		}
		static get template() {
			return ProductSwitchTemplate_lit;
		}
		static get ROW_MIN_WIDTH() {
			return {
				ONE_COLUMN: 600,
				THREE_COLUMN: 900,
			};
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		get _ariaLabelText() {
			return this.i18nBundle.getText(i18nDefaults.PRODUCT_SWITCH_CONTAINER_LABEL);
		}
		onEnterDOM() {
			this._handleResizeBound = this._handleResize.bind(this);
			ResizeHandler__default.register(document.body, this._handleResizeBound);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(document.body, this._handleResizeBound);
		}
		onBeforeRendering() {
			this.desktopColumns = this.items.length > 6 ? 4 : 3;
		}
		_handleResize() {
			const documentWidth = document.body.clientWidth;
			if (documentWidth <= this.constructor.ROW_MIN_WIDTH.ONE_COLUMN) {
				this._setRowSize(1);
			} else if (documentWidth <= this.constructor.ROW_MIN_WIDTH.THREE_COLUMN || this.items.length <= 6) {
				this._setRowSize(3);
			} else {
				this._setRowSize(4);
			}
		}
		_onfocusin(event) {
			const target = event.target;
			this._itemNavigation.setCurrentItem(target);
			this._currentIndex = this.items.indexOf(target);
		}
		_setRowSize(size) {
			this._rowSize = size;
			this._itemNavigation.setRowSize(size);
		}
		_onkeydown(event) {
			if (Keys.isDown(event)) {
				this._handleDown(event);
			} else if (Keys.isUp(event)) {
				this._handleUp(event);
			}
		}
		_handleDown(event) {
			const itemsLength = this.items.length;
			if (this._currentIndex + this._rowSize > itemsLength) {
				event.stopPropagation();
			}
		}
		_handleUp(event) {
			if (this._currentIndex - this._rowSize < 0) {
				event.stopPropagation();
			}
		}
	}
	ProductSwitch.define();

	return ProductSwitch;

});
