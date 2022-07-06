sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/timesheet', './v4/timesheet'], function (exports, Theme, timesheet$1, timesheet$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? timesheet$1.pathData : timesheet$2.pathData;
	var timesheet = "timesheet";

	exports.accData = timesheet$1.accData;
	exports.ltr = timesheet$1.ltr;
	exports.default = timesheet;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
