sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element'], function (UI5Element) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);

	const metadata = {
		tag: "ui5-cb-item",
		properties:  {
			text: { type: String },
			additionalText: { type: String },
		},
	};
	class ComboBoxItem extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
	}
	ComboBoxItem.define();

	return ComboBoxItem;

});
