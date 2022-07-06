sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/money-bills', './v4/money-bills'], function (exports, Theme, moneyBills$1, moneyBills$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? moneyBills$1.pathData : moneyBills$2.pathData;
	var moneyBills = "money-bills";

	exports.accData = moneyBills$1.accData;
	exports.ltr = moneyBills$1.ltr;
	exports.default = moneyBills;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
