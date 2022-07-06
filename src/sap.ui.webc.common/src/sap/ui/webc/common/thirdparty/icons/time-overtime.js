sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/time-overtime', './v4/time-overtime'], function (exports, Theme, timeOvertime$1, timeOvertime$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? timeOvertime$1.pathData : timeOvertime$2.pathData;
	var timeOvertime = "time-overtime";

	exports.accData = timeOvertime$1.accData;
	exports.ltr = timeOvertime$1.ltr;
	exports.default = timeOvertime;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
