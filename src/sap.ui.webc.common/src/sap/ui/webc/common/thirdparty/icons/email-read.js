sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/email-read', './v4/email-read'], function (Theme, emailRead$2, emailRead$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? emailRead$1 : emailRead$2;
	var emailRead = { pathData };

	return emailRead;

});
