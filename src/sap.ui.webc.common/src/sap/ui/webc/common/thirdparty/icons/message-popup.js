sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/message-popup', './v4/message-popup'], function (Theme, messagePopup$2, messagePopup$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? messagePopup$1 : messagePopup$2;
	var messagePopup = { pathData };

	return messagePopup;

});
