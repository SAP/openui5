sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/arrow-bottom', './v4/arrow-bottom'], function (exports, Theme, arrowBottom$1, arrowBottom$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? arrowBottom$1.pathData : arrowBottom$2.pathData;
	var arrowBottom = "arrow-bottom";

	exports.accData = arrowBottom$1.accData;
	exports.ltr = arrowBottom$1.ltr;
	exports.default = arrowBottom;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
