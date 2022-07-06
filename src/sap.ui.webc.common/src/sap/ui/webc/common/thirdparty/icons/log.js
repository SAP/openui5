sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/log', './v4/log'], function (exports, Theme, log$1, log$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? log$1.pathData : log$2.pathData;
	var log = "log";

	exports.accData = log$1.accData;
	exports.ltr = log$1.ltr;
	exports.default = log;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
