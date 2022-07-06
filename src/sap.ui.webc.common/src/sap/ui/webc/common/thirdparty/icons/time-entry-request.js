sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/time-entry-request', './v4/time-entry-request'], function (exports, Theme, timeEntryRequest$1, timeEntryRequest$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? timeEntryRequest$1.pathData : timeEntryRequest$2.pathData;
	var timeEntryRequest = "time-entry-request";

	exports.accData = timeEntryRequest$1.accData;
	exports.ltr = timeEntryRequest$1.ltr;
	exports.default = timeEntryRequest;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
