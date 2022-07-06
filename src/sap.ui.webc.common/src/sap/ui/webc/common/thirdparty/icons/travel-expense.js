sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/travel-expense', './v4/travel-expense'], function (exports, Theme, travelExpense$1, travelExpense$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? travelExpense$1.pathData : travelExpense$2.pathData;
	var travelExpense = "travel-expense";

	exports.accData = travelExpense$1.accData;
	exports.ltr = travelExpense$1.ltr;
	exports.default = travelExpense;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
