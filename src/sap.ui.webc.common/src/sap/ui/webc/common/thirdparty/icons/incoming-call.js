sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/incoming-call', './v4/incoming-call'], function (exports, Theme, incomingCall$1, incomingCall$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? incomingCall$1.pathData : incomingCall$2.pathData;
	var incomingCall = "incoming-call";

	exports.accData = incomingCall$1.accData;
	exports.ltr = incomingCall$1.ltr;
	exports.default = incomingCall;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
