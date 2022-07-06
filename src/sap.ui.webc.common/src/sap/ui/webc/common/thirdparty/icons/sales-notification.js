sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sales-notification', './v4/sales-notification'], function (exports, Theme, salesNotification$1, salesNotification$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? salesNotification$1.pathData : salesNotification$2.pathData;
	var salesNotification = "sales-notification";

	exports.accData = salesNotification$1.accData;
	exports.ltr = salesNotification$1.ltr;
	exports.default = salesNotification;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
