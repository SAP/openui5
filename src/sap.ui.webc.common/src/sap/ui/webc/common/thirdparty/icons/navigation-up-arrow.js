sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/navigation-up-arrow', './v4/navigation-up-arrow'], function (exports, Theme, navigationUpArrow$1, navigationUpArrow$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? navigationUpArrow$1.pathData : navigationUpArrow$2.pathData;
	var navigationUpArrow = "navigation-up-arrow";

	exports.accData = navigationUpArrow$1.accData;
	exports.ltr = navigationUpArrow$1.ltr;
	exports.default = navigationUpArrow;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
