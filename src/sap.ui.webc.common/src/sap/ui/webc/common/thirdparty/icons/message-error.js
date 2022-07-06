sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/message-error', './v4/message-error'], function (exports, Theme, messageError$1, messageError$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? messageError$1.pathData : messageError$2.pathData;
	var messageError = "message-error";

	exports.accData = messageError$1.accData;
	exports.ltr = messageError$1.ltr;
	exports.default = messageError;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
