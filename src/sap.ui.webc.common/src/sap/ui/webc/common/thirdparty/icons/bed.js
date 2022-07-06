sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bed', './v4/bed'], function (exports, Theme, bed$1, bed$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bed$1.pathData : bed$2.pathData;
	var bed = "bed";

	exports.accData = bed$1.accData;
	exports.ltr = bed$1.ltr;
	exports.default = bed;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
