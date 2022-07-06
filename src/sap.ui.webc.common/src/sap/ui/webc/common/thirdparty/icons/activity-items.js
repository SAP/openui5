sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/activity-items', './v4/activity-items'], function (exports, Theme, activityItems$1, activityItems$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? activityItems$1.pathData : activityItems$2.pathData;
	var activityItems = "activity-items";

	exports.accData = activityItems$1.accData;
	exports.ltr = activityItems$1.ltr;
	exports.default = activityItems;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
