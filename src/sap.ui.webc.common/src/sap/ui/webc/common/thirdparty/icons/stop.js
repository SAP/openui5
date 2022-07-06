sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/stop', './v4/stop'], function (exports, Theme, stop$1, stop$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? stop$1.pathData : stop$2.pathData;
	var stop = "stop";

	exports.accData = stop$1.accData;
	exports.ltr = stop$1.ltr;
	exports.default = stop;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
