sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/outgoing-call', './v4/outgoing-call'], function (exports, Theme, outgoingCall$1, outgoingCall$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? outgoingCall$1.pathData : outgoingCall$2.pathData;
	var outgoingCall = "outgoing-call";

	exports.accData = outgoingCall$1.accData;
	exports.ltr = outgoingCall$1.ltr;
	exports.default = outgoingCall;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
