sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/shipping-status', './v4/shipping-status'], function (exports, Theme, shippingStatus$1, shippingStatus$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? shippingStatus$1.pathData : shippingStatus$2.pathData;
	var shippingStatus = "shipping-status";

	exports.accData = shippingStatus$1.accData;
	exports.ltr = shippingStatus$1.ltr;
	exports.default = shippingStatus;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
