sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/navigation-down-arrow', './v4/navigation-down-arrow'], function (exports, Theme, navigationDownArrow$1, navigationDownArrow$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? navigationDownArrow$1.pathData : navigationDownArrow$2.pathData;
	var navigationDownArrow = "navigation-down-arrow";

	exports.accData = navigationDownArrow$1.accData;
	exports.ltr = navigationDownArrow$1.ltr;
	exports.default = navigationDownArrow;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
