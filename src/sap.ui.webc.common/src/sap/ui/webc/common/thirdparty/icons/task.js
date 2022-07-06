sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/task', './v4/task'], function (exports, Theme, task$1, task$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? task$1.pathData : task$2.pathData;
	var task = "task";

	exports.accData = task$1.accData;
	exports.ltr = task$1.ltr;
	exports.default = task;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
