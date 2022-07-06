sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-in-process', './v4/status-in-process'], function (exports, Theme, statusInProcess$1, statusInProcess$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? statusInProcess$1.pathData : statusInProcess$2.pathData;
	var statusInProcess = "status-in-process";

	exports.accData = statusInProcess$1.accData;
	exports.ltr = statusInProcess$1.ltr;
	exports.default = statusInProcess;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
