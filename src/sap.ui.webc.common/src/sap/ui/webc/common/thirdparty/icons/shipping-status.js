sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/shipping-status', './v4/shipping-status'], function (Theme, shippingStatus$2, shippingStatus$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? shippingStatus$1 : shippingStatus$2;
	var shippingStatus = { pathData };

	return shippingStatus;

});
