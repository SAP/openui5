sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/message-popup', './v4/message-popup'], function (exports, Theme, messagePopup$1, messagePopup$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? messagePopup$1.pathData : messagePopup$2.pathData;
	var messagePopup = "message-popup";

	exports.accData = messagePopup$1.accData;
	exports.ltr = messagePopup$1.ltr;
	exports.default = messagePopup;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
