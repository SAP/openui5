sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-activity', './v4/add-activity'], function (exports, Theme, addActivity$1, addActivity$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addActivity$1.pathData : addActivity$2.pathData;
	var addActivity = "add-activity";

	exports.accData = addActivity$1.accData;
	exports.ltr = addActivity$1.ltr;
	exports.default = addActivity;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
