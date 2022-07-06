sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/restart', './v4/restart'], function (exports, Theme, restart$1, restart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? restart$1.pathData : restart$2.pathData;
	var restart = "restart";

	exports.accData = restart$1.accData;
	exports.ltr = restart$1.ltr;
	exports.default = restart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
