sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element'], function (UI5Element) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);

	const metadata = {
		tag: "ui5-menu-item",
		properties:  {
			text: {
				type: String,
			},
			icon: {
				type: String,
			},
			startsSection: {
				type: Boolean,
			},
			disabled: {
				type: Boolean,
			},
			 _siblingsWithChildren: {
				type: Boolean,
				noAttribute: true,
			},
			 _siblingsWithIcon: {
				type: Boolean,
				noAttribute: true,
			},
			 _subMenu: {
				type: Object,
			},
			 _preventSubMenuClose: {
				type: Boolean,
				noAttribute: true,
			},
		},
		managedSlots: true,
		slots:  {
			 "default": {
				propertyName: "items",
				type: HTMLElement,
				invalidateOnChildChange: true,
			},
		},
	};
	class MenuItem extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		get hasChildren() {
			return !!this.items.length;
		}
		get hasDummyIcon() {
			return this._siblingsWithIcon && !this.icon;
		}
		get subMenuOpened() {
			return !!Object.keys(this._subMenu).length;
		}
	}
	MenuItem.define();

	return MenuItem;

});
