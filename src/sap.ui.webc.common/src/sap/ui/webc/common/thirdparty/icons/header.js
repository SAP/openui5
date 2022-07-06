sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/header', './v4/header'], function (exports, Theme, header$1, header$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? header$1.pathData : header$2.pathData;
	var header = "header";

	exports.accData = header$1.accData;
	exports.ltr = header$1.ltr;
	exports.default = header;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
