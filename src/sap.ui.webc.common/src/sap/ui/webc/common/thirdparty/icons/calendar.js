sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/calendar', './v4/calendar'], function (exports, Theme, calendar$1, calendar$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? calendar$1.pathData : calendar$2.pathData;
	var calendar = "calendar";

	exports.accData = calendar$1.accData;
	exports.ltr = calendar$1.ltr;
	exports.default = calendar;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
