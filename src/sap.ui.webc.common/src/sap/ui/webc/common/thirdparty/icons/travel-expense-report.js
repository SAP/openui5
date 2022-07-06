sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/travel-expense-report', './v4/travel-expense-report'], function (exports, Theme, travelExpenseReport$1, travelExpenseReport$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? travelExpenseReport$1.pathData : travelExpenseReport$2.pathData;
	var travelExpenseReport = "travel-expense-report";

	exports.accData = travelExpenseReport$1.accData;
	exports.ltr = travelExpenseReport$1.ltr;
	exports.default = travelExpenseReport;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
