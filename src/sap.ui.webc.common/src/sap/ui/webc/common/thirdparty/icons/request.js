sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/request', './v4/request'], function (exports, Theme, request$1, request$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? request$1.pathData : request$2.pathData;
	var request = "request";

	exports.accData = request$1.accData;
	exports.ltr = request$1.ltr;
	exports.default = request;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
