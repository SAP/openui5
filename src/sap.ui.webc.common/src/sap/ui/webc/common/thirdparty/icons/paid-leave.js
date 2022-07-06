sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/paid-leave', './v4/paid-leave'], function (exports, Theme, paidLeave$1, paidLeave$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? paidLeave$1.pathData : paidLeave$2.pathData;
	var paidLeave = "paid-leave";

	exports.accData = paidLeave$1.accData;
	exports.ltr = paidLeave$1.ltr;
	exports.default = paidLeave;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
