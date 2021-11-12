sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/action', './v4/action'], function (Theme, action$2, action$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? action$1 : action$2;
	var action = { pathData };

	return action;

});
