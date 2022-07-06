sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/lateness', './v4/lateness'], function (exports, Theme, lateness$1, lateness$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lateness$1.pathData : lateness$2.pathData;
	var lateness = "lateness";

	exports.accData = lateness$1.accData;
	exports.ltr = lateness$1.ltr;
	exports.default = lateness;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
