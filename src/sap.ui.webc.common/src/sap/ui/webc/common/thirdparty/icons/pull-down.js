sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pull-down', './v4/pull-down'], function (exports, Theme, pullDown$1, pullDown$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pullDown$1.pathData : pullDown$2.pathData;
	var pullDown = "pull-down";

	exports.accData = pullDown$1.accData;
	exports.ltr = pullDown$1.ltr;
	exports.default = pullDown;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
