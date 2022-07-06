sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/order-status', './v4/order-status'], function (exports, Theme, orderStatus$1, orderStatus$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? orderStatus$1.pathData : orderStatus$2.pathData;
	var orderStatus = "order-status";

	exports.accData = orderStatus$1.accData;
	exports.ltr = orderStatus$1.ltr;
	exports.default = orderStatus;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
