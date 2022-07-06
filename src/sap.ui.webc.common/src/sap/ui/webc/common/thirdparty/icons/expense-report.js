sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/expense-report', './v4/expense-report'], function (exports, Theme, expenseReport$1, expenseReport$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? expenseReport$1.pathData : expenseReport$2.pathData;
	var expenseReport = "expense-report";

	exports.accData = expenseReport$1.accData;
	exports.ltr = expenseReport$1.ltr;
	exports.default = expenseReport;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
