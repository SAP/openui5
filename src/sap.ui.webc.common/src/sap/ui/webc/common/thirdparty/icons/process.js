sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/process', './v4/process'], function (exports, Theme, process$1, process$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? process$1.pathData : process$2.pathData;
	var process = "process";

	exports.accData = process$1.accData;
	exports.ltr = process$1.ltr;
	exports.default = process;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
