sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/notification-2', './v4/notification-2'], function (Theme, notification2$2, notification2$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? notification2$1 : notification2$2;
	var notification2 = { pathData };

	return notification2;

});
