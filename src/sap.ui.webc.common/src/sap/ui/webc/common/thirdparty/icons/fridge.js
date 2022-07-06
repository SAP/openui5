sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/fridge', './v4/fridge'], function (exports, Theme, fridge$1, fridge$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? fridge$1.pathData : fridge$2.pathData;
	var fridge = "fridge";

	exports.accData = fridge$1.accData;
	exports.ltr = fridge$1.ltr;
	exports.default = fridge;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
