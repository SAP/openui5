sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/mileage', './v4/mileage'], function (exports, Theme, mileage$1, mileage$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mileage$1.pathData : mileage$2.pathData;
	var mileage = "mileage";

	exports.accData = mileage$1.accData;
	exports.ltr = mileage$1.ltr;
	exports.default = mileage;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
