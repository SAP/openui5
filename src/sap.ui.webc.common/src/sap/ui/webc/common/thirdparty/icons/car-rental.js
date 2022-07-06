sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/car-rental', './v4/car-rental'], function (exports, Theme, carRental$1, carRental$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? carRental$1.pathData : carRental$2.pathData;
	var carRental = "car-rental";

	exports.accData = carRental$1.accData;
	exports.ltr = carRental$1.ltr;
	exports.default = carRental;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
