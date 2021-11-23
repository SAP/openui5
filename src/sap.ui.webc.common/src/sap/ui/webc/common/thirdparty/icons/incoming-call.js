sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/incoming-call', './v4/incoming-call'], function (Theme, incomingCall$2, incomingCall$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? incomingCall$1 : incomingCall$2;
	var incomingCall = { pathData };

	return incomingCall;

});
