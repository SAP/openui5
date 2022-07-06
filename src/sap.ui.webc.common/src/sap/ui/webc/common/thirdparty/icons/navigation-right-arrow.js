sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/navigation-right-arrow', './v4/navigation-right-arrow'], function (exports, Theme, navigationRightArrow$1, navigationRightArrow$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? navigationRightArrow$1.pathData : navigationRightArrow$2.pathData;
	var navigationRightArrow = "navigation-right-arrow";

	exports.accData = navigationRightArrow$1.accData;
	exports.ltr = navigationRightArrow$1.ltr;
	exports.default = navigationRightArrow;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
