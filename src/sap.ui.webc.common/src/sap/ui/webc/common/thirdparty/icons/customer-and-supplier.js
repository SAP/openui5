sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-and-supplier', './v4/customer-and-supplier'], function (Theme, customerAndSupplier$2, customerAndSupplier$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? customerAndSupplier$1 : customerAndSupplier$2;
	var customerAndSupplier = { pathData };

	return customerAndSupplier;

});
