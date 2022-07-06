sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/master-task-triangle', './v4/master-task-triangle'], function (exports, Theme, masterTaskTriangle$1, masterTaskTriangle$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? masterTaskTriangle$1.pathData : masterTaskTriangle$2.pathData;
	var masterTaskTriangle = "master-task-triangle";

	exports.accData = masterTaskTriangle$1.accData;
	exports.ltr = masterTaskTriangle$1.ltr;
	exports.default = masterTaskTriangle;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
