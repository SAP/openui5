sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/future', './v4/future'], function (exports, Theme, future$1, future$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? future$1.pathData : future$2.pathData;
	var future = "future";

	exports.accData = future$1.accData;
	exports.ltr = future$1.ltr;
	exports.default = future;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
