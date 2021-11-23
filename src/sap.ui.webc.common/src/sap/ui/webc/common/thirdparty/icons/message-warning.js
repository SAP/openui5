sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/message-warning', './v4/message-warning'], function (Theme, messageWarning$2, messageWarning$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? messageWarning$1 : messageWarning$2;
	var messageWarning = { pathData };

	return messageWarning;

});
