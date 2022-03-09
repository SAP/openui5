sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/notification', './v4/notification'], function (Theme, notification$2, notification$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? notification$1 : notification$2;
	var notification = { pathData };

	return notification;

});
