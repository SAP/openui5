sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/travel-expense', './v4/travel-expense'], function (Theme, travelExpense$2, travelExpense$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? travelExpense$1 : travelExpense$2;
	var travelExpense = { pathData };

	return travelExpense;

});
