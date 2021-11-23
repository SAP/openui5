sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/money-bills', './v4/money-bills'], function (Theme, moneyBills$2, moneyBills$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? moneyBills$1 : moneyBills$2;
	var moneyBills = { pathData };

	return moneyBills;

});
