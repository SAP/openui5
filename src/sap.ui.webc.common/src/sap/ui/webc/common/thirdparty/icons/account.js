sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/account', './v4/account'], function (exports, Theme, account$1, account$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? account$1.pathData : account$2.pathData;
	var account = "account";

	exports.accData = account$1.accData;
	exports.ltr = account$1.ltr;
	exports.default = account;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
