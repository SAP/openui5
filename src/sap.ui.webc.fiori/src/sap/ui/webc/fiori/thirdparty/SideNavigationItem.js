sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element'], function (UI5Element) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);

	const metadata = {
		tag: "ui5-side-navigation-item",
		managedSlots: true,
		properties:  {
			text: {
				type: String,
			},
			icon: {
				type: String,
			},
			expanded: {
				type: Boolean,
			},
			selected: {
				type: Boolean,
			},
			wholeItemToggleable: {
				type: Boolean,
			},
		},
		events:  {
		},
		slots:  {
			"default": {
				propertyName: "items",
				invalidateOnChildChange: true,
				type: HTMLElement,
			},
		},
	};
	class SideNavigationItem extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
	}
	SideNavigationItem.define();

	return SideNavigationItem;

});
