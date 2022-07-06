sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/arrow-right', './v4/arrow-right'], function (exports, Theme, arrowRight$1, arrowRight$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? arrowRight$1.pathData : arrowRight$2.pathData;
	var arrowRight = "arrow-right";

	exports.accData = arrowRight$1.accData;
	exports.ltr = arrowRight$1.ltr;
	exports.default = arrowRight;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
