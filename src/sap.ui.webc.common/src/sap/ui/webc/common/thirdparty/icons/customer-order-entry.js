sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-order-entry', './v4/customer-order-entry'], function (Theme, customerOrderEntry$2, customerOrderEntry$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? customerOrderEntry$1 : customerOrderEntry$2;
	var customerOrderEntry = { pathData };

	return customerOrderEntry;

});
