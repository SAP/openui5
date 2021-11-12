sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/order-status', './v4/order-status'], function (Theme, orderStatus$2, orderStatus$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? orderStatus$1 : orderStatus$2;
	var orderStatus = { pathData };

	return orderStatus;

});
