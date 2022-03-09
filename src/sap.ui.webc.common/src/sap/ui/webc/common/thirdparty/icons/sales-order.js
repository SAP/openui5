sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sales-order', './v4/sales-order'], function (Theme, salesOrder$2, salesOrder$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? salesOrder$1 : salesOrder$2;
	var salesOrder = { pathData };

	return salesOrder;

});
