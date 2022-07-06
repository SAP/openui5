sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/email', './v4/email'], function (exports, Theme, email$1, email$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? email$1.pathData : email$2.pathData;
	var email = "email";

	exports.accData = email$1.accData;
	exports.ltr = email$1.ltr;
	exports.default = email;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
