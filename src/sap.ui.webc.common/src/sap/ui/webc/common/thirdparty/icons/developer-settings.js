sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/developer-settings', './v4/developer-settings'], function (Theme, developerSettings$2, developerSettings$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? developerSettings$1 : developerSettings$2;
	var developerSettings = { pathData };

	return developerSettings;

});
