sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/time-account', './v4/time-account'], function (exports, Theme, timeAccount$1, timeAccount$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? timeAccount$1.pathData : timeAccount$2.pathData;
	var timeAccount = "time-account";

	exports.accData = timeAccount$1.accData;
	exports.ltr = timeAccount$1.ltr;
	exports.default = timeAccount;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
