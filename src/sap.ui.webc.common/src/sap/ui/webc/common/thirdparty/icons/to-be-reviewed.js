sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/to-be-reviewed', './v4/to-be-reviewed'], function (exports, Theme, toBeReviewed$1, toBeReviewed$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? toBeReviewed$1.pathData : toBeReviewed$2.pathData;
	var toBeReviewed = "to-be-reviewed";

	exports.accData = toBeReviewed$1.accData;
	exports.ltr = toBeReviewed$1.ltr;
	exports.default = toBeReviewed;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
