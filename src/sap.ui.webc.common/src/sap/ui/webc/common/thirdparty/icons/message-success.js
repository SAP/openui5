sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/message-success', './v4/message-success'], function (Theme, messageSuccess$2, messageSuccess$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? messageSuccess$1 : messageSuccess$2;
	var messageSuccess = { pathData };

	return messageSuccess;

});
