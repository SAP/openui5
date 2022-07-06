sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/education', './v4/education'], function (exports, Theme, education$1, education$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? education$1.pathData : education$2.pathData;
	var education = "education";

	exports.accData = education$1.accData;
	exports.ltr = education$1.ltr;
	exports.default = education;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
