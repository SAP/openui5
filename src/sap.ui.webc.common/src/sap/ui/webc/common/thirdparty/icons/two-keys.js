sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/two-keys', './v4/two-keys'], function (exports, Theme, twoKeys$1, twoKeys$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? twoKeys$1.pathData : twoKeys$2.pathData;
	var twoKeys = "two-keys";

	exports.accData = twoKeys$1.accData;
	exports.ltr = twoKeys$1.ltr;
	exports.default = twoKeys;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
