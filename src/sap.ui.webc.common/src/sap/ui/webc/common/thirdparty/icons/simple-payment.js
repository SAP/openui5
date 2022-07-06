sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/simple-payment', './v4/simple-payment'], function (exports, Theme, simplePayment$1, simplePayment$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? simplePayment$1.pathData : simplePayment$2.pathData;
	var simplePayment = "simple-payment";

	exports.accData = simplePayment$1.accData;
	exports.ltr = simplePayment$1.ltr;
	exports.default = simplePayment;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
