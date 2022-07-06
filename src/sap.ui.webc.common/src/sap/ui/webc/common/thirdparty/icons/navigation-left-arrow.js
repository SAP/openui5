sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/navigation-left-arrow', './v4/navigation-left-arrow'], function (exports, Theme, navigationLeftArrow$1, navigationLeftArrow$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? navigationLeftArrow$1.pathData : navigationLeftArrow$2.pathData;
	var navigationLeftArrow = "navigation-left-arrow";

	exports.accData = navigationLeftArrow$1.accData;
	exports.ltr = navigationLeftArrow$1.ltr;
	exports.default = navigationLeftArrow;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
