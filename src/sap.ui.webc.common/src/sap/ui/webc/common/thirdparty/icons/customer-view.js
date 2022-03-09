sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-view', './v4/customer-view'], function (Theme, customerView$2, customerView$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customerView$1 : customerView$2;
	var customerView = { pathData };

	return customerView;

});
