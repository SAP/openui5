sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sales-order-item', './v4/sales-order-item'], function (Theme, salesOrderItem$2, salesOrderItem$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? salesOrderItem$1 : salesOrderItem$2;
	var salesOrderItem = { pathData };

	return salesOrderItem;

});
