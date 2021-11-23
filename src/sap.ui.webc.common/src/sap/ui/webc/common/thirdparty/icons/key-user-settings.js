sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/key-user-settings', './v4/key-user-settings'], function (Theme, keyUserSettings$2, keyUserSettings$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? keyUserSettings$1 : keyUserSettings$2;
	var keyUserSettings = { pathData };

	return keyUserSettings;

});
