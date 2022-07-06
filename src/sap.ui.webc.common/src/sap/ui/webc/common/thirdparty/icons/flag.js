sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/flag', './v4/flag'], function (exports, Theme, flag$1, flag$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? flag$1.pathData : flag$2.pathData;
	var flag = "flag";

	exports.accData = flag$1.accData;
	exports.ltr = flag$1.ltr;
	exports.default = flag;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
