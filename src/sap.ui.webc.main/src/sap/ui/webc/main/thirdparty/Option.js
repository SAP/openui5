sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element'], function (UI5Element) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);

	const metadata = {
		tag: "ui5-option",
		managedSlots: true,
		properties:  {
			selected: {
				type: Boolean,
			},
			disabled: {
				type: Boolean,
			},
			icon: {
				type: String,
				defaultValue: null,
			},
			value: {
				type: String,
			},
			stableDomRef: {
				type: String,
			},
			_focused: {
				type: Boolean,
			},
		},
		slots:  {
			"default": {
				type: Node,
			},
		},
		events:  {},
	};
	class Option extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
	}
	Option.define();

	return Option;

});
