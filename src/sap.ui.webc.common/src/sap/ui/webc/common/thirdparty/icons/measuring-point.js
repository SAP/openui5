sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/measuring-point', './v4/measuring-point'], function (exports, Theme, measuringPoint$1, measuringPoint$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? measuringPoint$1.pathData : measuringPoint$2.pathData;
	var measuringPoint = "measuring-point";

	exports.accData = measuringPoint$1.accData;
	exports.ltr = measuringPoint$1.ltr;
	exports.default = measuringPoint;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
