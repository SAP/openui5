sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/message-success', './v4/message-success'], function (exports, Theme, messageSuccess$1, messageSuccess$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? messageSuccess$1.pathData : messageSuccess$2.pathData;
	var messageSuccess = "message-success";

	exports.accData = messageSuccess$1.accData;
	exports.ltr = messageSuccess$1.ltr;
	exports.default = messageSuccess;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
