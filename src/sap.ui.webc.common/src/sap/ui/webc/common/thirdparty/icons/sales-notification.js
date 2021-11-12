sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sales-notification', './v4/sales-notification'], function (Theme, salesNotification$2, salesNotification$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? salesNotification$1 : salesNotification$2;
	var salesNotification = { pathData };

	return salesNotification;

});
