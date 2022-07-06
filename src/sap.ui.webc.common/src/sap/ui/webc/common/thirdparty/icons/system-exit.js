sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/system-exit', './v4/system-exit'], function (exports, Theme, systemExit$1, systemExit$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? systemExit$1.pathData : systemExit$2.pathData;
	var systemExit = "system-exit";

	exports.accData = systemExit$1.accData;
	exports.ltr = systemExit$1.ltr;
	exports.default = systemExit;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
