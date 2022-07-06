sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/stethoscope', './v4/stethoscope'], function (exports, Theme, stethoscope$1, stethoscope$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? stethoscope$1.pathData : stethoscope$2.pathData;
	var stethoscope = "stethoscope";

	exports.accData = stethoscope$1.accData;
	exports.ltr = stethoscope$1.ltr;
	exports.default = stethoscope;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
