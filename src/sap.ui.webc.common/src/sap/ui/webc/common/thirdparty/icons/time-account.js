sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/time-account', './v4/time-account'], function (Theme, timeAccount$2, timeAccount$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? timeAccount$1 : timeAccount$2;
	var timeAccount = { pathData };

	return timeAccount;

});
