sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-financial-fact-sheet', './v4/customer-financial-fact-sheet'], function (Theme, customerFinancialFactSheet$2, customerFinancialFactSheet$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customerFinancialFactSheet$1 : customerFinancialFactSheet$2;
	var customerFinancialFactSheet = { pathData };

	return customerFinancialFactSheet;

});
