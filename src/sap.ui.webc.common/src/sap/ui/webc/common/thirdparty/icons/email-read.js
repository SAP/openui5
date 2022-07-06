sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/email-read', './v4/email-read'], function (exports, Theme, emailRead$1, emailRead$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? emailRead$1.pathData : emailRead$2.pathData;
	var emailRead = "email-read";

	exports.accData = emailRead$1.accData;
	exports.ltr = emailRead$1.ltr;
	exports.default = emailRead;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
