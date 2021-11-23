sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/ui-notifications', './v4/ui-notifications'], function (Theme, uiNotifications$2, uiNotifications$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? uiNotifications$1 : uiNotifications$2;
	var uiNotifications = { pathData };

	return uiNotifications;

});
