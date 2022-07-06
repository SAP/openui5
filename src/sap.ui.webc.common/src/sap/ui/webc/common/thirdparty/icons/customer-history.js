sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-history', './v4/customer-history'], function (exports, Theme, customerHistory$1, customerHistory$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customerHistory$1.pathData : customerHistory$2.pathData;
	var customerHistory = "customer-history";

	exports.accData = customerHistory$1.accData;
	exports.ltr = customerHistory$1.ltr;
	exports.default = customerHistory;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
