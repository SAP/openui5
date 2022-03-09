sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/create-session', './v4/create-session'], function (Theme, createSession$2, createSession$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? createSession$1 : createSession$2;
	var createSession = { pathData };

	return createSession;

});
