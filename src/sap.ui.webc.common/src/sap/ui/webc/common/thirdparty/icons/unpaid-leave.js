sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/unpaid-leave', './v4/unpaid-leave'], function (exports, Theme, unpaidLeave$1, unpaidLeave$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? unpaidLeave$1.pathData : unpaidLeave$2.pathData;
	var unpaidLeave = "unpaid-leave";

	exports.accData = unpaidLeave$1.accData;
	exports.ltr = unpaidLeave$1.ltr;
	exports.default = unpaidLeave;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
