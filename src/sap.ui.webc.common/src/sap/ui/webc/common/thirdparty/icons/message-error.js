sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/message-error', './v4/message-error'], function (Theme, messageError$2, messageError$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? messageError$1 : messageError$2;
	var messageError = { pathData };

	return messageError;

});
