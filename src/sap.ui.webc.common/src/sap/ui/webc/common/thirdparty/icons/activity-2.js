sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/activity-2', './v4/activity-2'], function (exports, Theme, activity2$1, activity2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? activity2$1.pathData : activity2$2.pathData;
	var activity2 = "activity-2";

	exports.accData = activity2$1.accData;
	exports.ltr = activity2$1.ltr;
	exports.default = activity2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
