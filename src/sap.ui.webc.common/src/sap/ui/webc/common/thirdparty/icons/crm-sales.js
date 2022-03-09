sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/crm-sales', './v4/crm-sales'], function (Theme, crmSales$2, crmSales$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? crmSales$1 : crmSales$2;
	var crmSales = { pathData };

	return crmSales;

});
