sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/payment-approval', './v4/payment-approval'], function (exports, Theme, paymentApproval$1, paymentApproval$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? paymentApproval$1.pathData : paymentApproval$2.pathData;
	var paymentApproval = "payment-approval";

	exports.accData = paymentApproval$1.accData;
	exports.ltr = paymentApproval$1.ltr;
	exports.default = paymentApproval;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
