sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer', './v4/customer'], function (Theme, customer$2, customer$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? customer$1 : customer$2;
	var customer = { pathData };

	return customer;

});
