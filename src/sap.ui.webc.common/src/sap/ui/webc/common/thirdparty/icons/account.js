sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/account', './v4/account'], function (Theme, account$2, account$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? account$1 : account$2;
	var account = { pathData };

	return account;

});
