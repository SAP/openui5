sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-activity-2', './v4/add-activity-2'], function (exports, Theme, addActivity2$1, addActivity2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addActivity2$1.pathData : addActivity2$2.pathData;
	var addActivity2 = "add-activity-2";

	exports.accData = addActivity2$1.accData;
	exports.ltr = addActivity2$1.ltr;
	exports.default = addActivity2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
