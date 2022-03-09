sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/travel-expense-report', './v4/travel-expense-report'], function (Theme, travelExpenseReport$2, travelExpenseReport$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? travelExpenseReport$1 : travelExpenseReport$2;
	var travelExpenseReport = { pathData };

	return travelExpenseReport;

});
