sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/outgoing-call', './v4/outgoing-call'], function (Theme, outgoingCall$2, outgoingCall$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? outgoingCall$1 : outgoingCall$2;
	var outgoingCall = { pathData };

	return outgoingCall;

});
