sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/fallback', './v4/fallback'], function (exports, Theme, fallback$1, fallback$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? fallback$1.pathData : fallback$2.pathData;
	var fallback = "fallback";

	exports.accData = fallback$1.accData;
	exports.ltr = fallback$1.ltr;
	exports.default = fallback;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
