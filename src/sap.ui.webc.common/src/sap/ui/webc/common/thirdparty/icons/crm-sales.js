sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/crm-sales', './v4/crm-sales'], function (exports, Theme, crmSales$1, crmSales$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? crmSales$1.pathData : crmSales$2.pathData;
	var crmSales = "crm-sales";

	exports.accData = crmSales$1.accData;
	exports.ltr = crmSales$1.ltr;
	exports.default = crmSales;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
