sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/commission-check', './v4/commission-check'], function (exports, Theme, commissionCheck$1, commissionCheck$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? commissionCheck$1.pathData : commissionCheck$2.pathData;
	var commissionCheck = "commission-check";

	exports.accData = commissionCheck$1.accData;
	exports.ltr = commissionCheck$1.ltr;
	exports.default = commissionCheck;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
