sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-financial-fact-sheet', './v4/customer-financial-fact-sheet'], function (exports, Theme, customerFinancialFactSheet$1, customerFinancialFactSheet$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customerFinancialFactSheet$1.pathData : customerFinancialFactSheet$2.pathData;
	var customerFinancialFactSheet = "customer-financial-fact-sheet";

	exports.accData = customerFinancialFactSheet$1.accData;
	exports.ltr = customerFinancialFactSheet$1.ltr;
	exports.default = customerFinancialFactSheet;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
