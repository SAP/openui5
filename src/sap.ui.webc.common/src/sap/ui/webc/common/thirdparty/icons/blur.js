sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/blur', './v4/blur'], function (exports, Theme, blur$1, blur$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? blur$1.pathData : blur$2.pathData;
	var blur = "blur";

	exports.accData = blur$1.accData;
	exports.ltr = blur$1.ltr;
	exports.default = blur;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
