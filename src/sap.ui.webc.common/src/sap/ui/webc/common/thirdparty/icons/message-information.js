sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/message-information', './v4/message-information'], function (Theme, messageInformation$2, messageInformation$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? messageInformation$1 : messageInformation$2;
	var messageInformation = { pathData };

	return messageInformation;

});
