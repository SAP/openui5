sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/expense-report', './v4/expense-report'], function (Theme, expenseReport$2, expenseReport$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? expenseReport$1 : expenseReport$2;
	var expenseReport = { pathData };

	return expenseReport;

});
