sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sum', './v4/sum'], function (exports, Theme, sum$1, sum$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sum$1.pathData : sum$2.pathData;
	var sum = "sum";

	exports.accData = sum$1.accData;
	exports.ltr = sum$1.ltr;
	exports.default = sum;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
