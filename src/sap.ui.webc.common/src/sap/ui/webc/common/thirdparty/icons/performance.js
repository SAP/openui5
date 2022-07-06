sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/performance', './v4/performance'], function (exports, Theme, performance$1, performance$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? performance$1.pathData : performance$2.pathData;
	var performance = "performance";

	exports.accData = performance$1.accData;
	exports.ltr = performance$1.ltr;
	exports.default = performance;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
