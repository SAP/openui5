sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/weather-proofing', './v4/weather-proofing'], function (exports, Theme, weatherProofing$1, weatherProofing$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? weatherProofing$1.pathData : weatherProofing$2.pathData;
	var weatherProofing = "weather-proofing";

	exports.accData = weatherProofing$1.accData;
	exports.ltr = weatherProofing$1.ltr;
	exports.default = weatherProofing;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
