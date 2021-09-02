sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/types/ValueState'], function (UI5Element, ValueState) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);

	const metadata = {
		tag: "ui5-tree-item",
		properties:  {
			text: {
				type: String,
			},
			expanded: {
				type: Boolean,
			},
			hasChildren: {
				type: Boolean,
			},
			selected: {
				type: Boolean,
			},
			icon: {
				type: String,
			},
			additionalText: {
				type: String,
			},
			additionalTextState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
			title: {
				type: String,
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
	class TreeItem extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		get requiresToggleButton() {
			return this.hasChildren || this.items.length > 0;
		}
		toggle() {
			this.expanded = !this.expanded;
		}
	}
	TreeItem.define();

	return TreeItem;

});
