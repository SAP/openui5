sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/message-warning', './v4/message-warning'], function (exports, Theme, messageWarning$1, messageWarning$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? messageWarning$1.pathData : messageWarning$2.pathData;
	var messageWarning = "message-warning";

	exports.accData = messageWarning$1.accData;
	exports.ltr = messageWarning$1.ltr;
	exports.default = messageWarning;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
