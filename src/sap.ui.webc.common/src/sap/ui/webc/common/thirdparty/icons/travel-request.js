sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/travel-request', './v4/travel-request'], function (exports, Theme, travelRequest$1, travelRequest$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? travelRequest$1.pathData : travelRequest$2.pathData;
	var travelRequest = "travel-request";

	exports.accData = travelRequest$1.accData;
	exports.ltr = travelRequest$1.ltr;
	exports.default = travelRequest;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
