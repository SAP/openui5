sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/user-settings', './v4/user-settings'], function (Theme, userSettings$2, userSettings$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? userSettings$1 : userSettings$2;
	var userSettings = { pathData };

	return userSettings;

});
