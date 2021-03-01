sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/main/thirdparty/Icon', './generated/templates/ProductSwitchItemTemplate.lit', './generated/themes/ProductSwitchItem.css'], function (UI5Element, litRender, Keys, Icon, ProductSwitchItemTemplate_lit, ProductSwitchItem_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Icon__default = /*#__PURE__*/_interopDefaultLegacy(Icon);

	const metadata = {
		tag: "ui5-product-switch-item",
		properties:  {
			titleText: {
				type: String,
			},
			 subtitleText: {
				type: String,
			},
			icon: {
				type: String,
			},
			target: {
				type: String,
				defaultValue: "_self",
			},
			targetSrc: {
				type: String,
			},
			active: {
				type: Boolean,
			},
			focused: {
				type: Boolean,
			},
			_tabIndex: {
				type: String,
				defaultValue: "-1",
				noAttribute: true,
			},
		},
		slots:  {
		},
		events:  {
			click: {},
			_focused: {},
		},
	};
	class ProductSwitchItem extends UI5Element__default {
		constructor() {
			super();
			this._deactivate = () => {
				if (this.active) {
					this.active = false;
				}
			};
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return ProductSwitchItem_css;
		}
		static get template() {
			return ProductSwitchItemTemplate_lit;
		}
		onEnterDOM() {
			document.addEventListener("mouseup", this._deactivate);
		}
		onExitDOM() {
			document.removeEventListener("mouseup", this._deactivate);
		}
		_onmousedown() {
			this.active = true;
		}
		_onkeydown(event) {
			if (Keys.isSpace(event) || Keys.isEnter(event)) {
				this.active = true;
			}
			if (Keys.isSpace(event)) {
				event.preventDefault();
			}
			if (Keys.isEnter(event)) {
				this._fireItemClick();
			}
		}
		_onkeyup(event) {
			if (Keys.isSpace(event) || Keys.isEnter(event)) {
				this.active = false;
			}
			if (Keys.isSpace(event)) {
				this._fireItemClick();
			}
		}
		_onfocusout() {
			this.active = false;
			this.focused = false;
		}
		_onfocusin(event) {
			this.focused = true;
			this.fireEvent("_focused", event);
		}
		_fireItemClick() {
			this.fireEvent("click", { item: this });
		}
		static get dependencies() {
			return [Icon__default];
		}
	}
	ProductSwitchItem.define();

	return ProductSwitchItem;

});
