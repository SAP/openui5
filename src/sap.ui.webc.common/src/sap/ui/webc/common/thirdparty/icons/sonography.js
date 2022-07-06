sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sonography', './v4/sonography'], function (exports, Theme, sonography$1, sonography$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sonography$1.pathData : sonography$2.pathData;
	var sonography = "sonography";

	exports.accData = sonography$1.accData;
	exports.ltr = sonography$1.ltr;
	exports.default = sonography;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
