sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/refresh', './v4/refresh'], function (exports, Theme, refresh$1, refresh$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? refresh$1.pathData : refresh$2.pathData;
	var refresh = "refresh";

	exports.accData = refresh$1.accData;
	exports.ltr = refresh$1.ltr;
	exports.default = refresh;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
