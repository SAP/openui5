sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/email', './v4/email'], function (Theme, email$2, email$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? email$1 : email$2;
	var email = { pathData };

	return email;

});
