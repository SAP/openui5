sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/master-task-triangle-2', './v4/master-task-triangle-2'], function (exports, Theme, masterTaskTriangle2$1, masterTaskTriangle2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? masterTaskTriangle2$1.pathData : masterTaskTriangle2$2.pathData;
	var masterTaskTriangle2 = "master-task-triangle-2";

	exports.accData = masterTaskTriangle2$1.accData;
	exports.ltr = masterTaskTriangle2$1.ltr;
	exports.default = masterTaskTriangle2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
