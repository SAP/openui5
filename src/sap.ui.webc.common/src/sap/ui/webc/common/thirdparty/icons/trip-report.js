sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/trip-report', './v4/trip-report'], function (exports, Theme, tripReport$1, tripReport$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tripReport$1.pathData : tripReport$2.pathData;
	var tripReport = "trip-report";

	exports.accData = tripReport$1.accData;
	exports.ltr = tripReport$1.ltr;
	exports.default = tripReport;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
