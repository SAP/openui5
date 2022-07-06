sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/flight', './v4/flight'], function (exports, Theme, flight$1, flight$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? flight$1.pathData : flight$2.pathData;
	var flight = "flight";

	exports.accData = flight$1.accData;
	exports.ltr = flight$1.ltr;
	exports.default = flight;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
