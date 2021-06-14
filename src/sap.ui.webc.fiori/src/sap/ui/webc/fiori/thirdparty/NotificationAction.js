sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/main/thirdparty/types/ButtonDesign'], function (UI5Element, ButtonDesign) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var ButtonDesign__default = /*#__PURE__*/_interopDefaultLegacy(ButtonDesign);

	const metadata = {
		tag: "ui5-notification-action",
		properties:  {
			text: {
				type: String,
			},
			disabled: {
				type: Boolean,
			},
			design: {
				type: ButtonDesign__default,
				defaultValue: ButtonDesign__default.Transparent,
			},
			icon: {
				type: String,
			},
		},
		slots:  {
		},
		events:  {
			click: {},
		},
	};
	class NotificationAction extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
	}
	NotificationAction.define();

	return NotificationAction;

});
