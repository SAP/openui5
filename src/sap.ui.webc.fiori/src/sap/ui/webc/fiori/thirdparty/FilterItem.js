sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element'], function (UI5Element) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);

	const metadata = {
		tag: "ui5-filter-item",
		managedSlots: true,
		properties:  {
			text: {
				type: String,
			},
			additionalText: {
				type: String,
			},
		},
		slots:  {
			values: {
				type: HTMLElement,
			},
		},
		events:  {
		},
	};
	class FilterItem extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
	}
	FilterItem.define();

	return FilterItem;

});
