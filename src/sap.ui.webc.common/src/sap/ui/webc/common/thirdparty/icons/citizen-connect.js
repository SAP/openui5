sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/citizen-connect', './v4/citizen-connect'], function (Theme, citizenConnect$2, citizenConnect$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? citizenConnect$1 : citizenConnect$2;
	var citizenConnect = { pathData };

	return citizenConnect;

});
