sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/my-sales-order', './v4/my-sales-order'], function (Theme, mySalesOrder$2, mySalesOrder$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mySalesOrder$1 : mySalesOrder$2;
	var mySalesOrder = { pathData };

	return mySalesOrder;

});
