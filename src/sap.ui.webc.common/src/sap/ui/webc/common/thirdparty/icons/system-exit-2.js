sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/system-exit-2', './v4/system-exit-2'], function (exports, Theme, systemExit2$1, systemExit2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? systemExit2$1.pathData : systemExit2$2.pathData;
	var systemExit2 = "system-exit-2";

	exports.accData = systemExit2$1.accData;
	exports.ltr = systemExit2$1.ltr;
	exports.default = systemExit2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
