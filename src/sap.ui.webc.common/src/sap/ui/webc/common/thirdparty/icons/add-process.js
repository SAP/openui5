sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-process', './v4/add-process'], function (exports, Theme, addProcess$1, addProcess$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addProcess$1.pathData : addProcess$2.pathData;
	var addProcess = "add-process";

	exports.accData = addProcess$1.accData;
	exports.ltr = addProcess$1.ltr;
	exports.default = addProcess;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
