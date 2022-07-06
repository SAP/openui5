sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/message-information', './v4/message-information'], function (exports, Theme, messageInformation$1, messageInformation$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? messageInformation$1.pathData : messageInformation$2.pathData;
	var messageInformation = "message-information";

	exports.accData = messageInformation$1.accData;
	exports.ltr = messageInformation$1.ltr;
	exports.default = messageInformation;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
