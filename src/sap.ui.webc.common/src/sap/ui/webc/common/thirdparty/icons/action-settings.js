sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/action-settings', './v4/action-settings'], function (Theme, actionSettings$2, actionSettings$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? actionSettings$1 : actionSettings$2;
	var actionSettings = { pathData };

	return actionSettings;

});
