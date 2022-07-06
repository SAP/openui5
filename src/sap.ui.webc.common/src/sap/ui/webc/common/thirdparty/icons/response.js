sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/response', './v4/response'], function (exports, Theme, response$1, response$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? response$1.pathData : response$2.pathData;
	var response = "response";

	exports.accData = response$1.accData;
	exports.ltr = response$1.ltr;
	exports.default = response;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
