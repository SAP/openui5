sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/survey', './v4/survey'], function (exports, Theme, survey$1, survey$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? survey$1.pathData : survey$2.pathData;
	var survey = "survey";

	exports.accData = survey$1.accData;
	exports.ltr = survey$1.ltr;
	exports.default = survey;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
