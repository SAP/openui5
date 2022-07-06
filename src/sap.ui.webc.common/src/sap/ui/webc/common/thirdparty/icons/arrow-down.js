sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/arrow-down', './v4/arrow-down'], function (exports, Theme, arrowDown$1, arrowDown$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? arrowDown$1.pathData : arrowDown$2.pathData;
	var arrowDown = "arrow-down";

	exports.accData = arrowDown$1.accData;
	exports.ltr = arrowDown$1.ltr;
	exports.default = arrowDown;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
