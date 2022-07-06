sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/date-time', './v4/date-time'], function (exports, Theme, dateTime$1, dateTime$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? dateTime$1.pathData : dateTime$2.pathData;
	var dateTime = "date-time";

	exports.accData = dateTime$1.accData;
	exports.ltr = dateTime$1.ltr;
	exports.default = dateTime;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
