sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-history', './v4/customer-history'], function (Theme, customerHistory$2, customerHistory$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? customerHistory$1 : customerHistory$2;
	var customerHistory = { pathData };

	return customerHistory;

});
