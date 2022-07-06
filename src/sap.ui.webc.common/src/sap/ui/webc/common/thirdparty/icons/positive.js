sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/positive', './v4/positive'], function (exports, Theme, positive$1, positive$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? positive$1.pathData : positive$2.pathData;
	var positive = "positive";

	exports.accData = positive$1.accData;
	exports.ltr = positive$1.ltr;
	exports.default = positive;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
