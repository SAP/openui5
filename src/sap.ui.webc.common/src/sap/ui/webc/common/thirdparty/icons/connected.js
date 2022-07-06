sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/connected', './v4/connected'], function (exports, Theme, connected$1, connected$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? connected$1.pathData : connected$2.pathData;
	var connected = "connected";

	exports.accData = connected$1.accData;
	exports.ltr = connected$1.ltr;
	exports.default = connected;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
