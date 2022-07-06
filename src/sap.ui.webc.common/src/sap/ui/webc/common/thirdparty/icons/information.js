sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/information', './v4/information'], function (exports, Theme, information$1, information$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? information$1.pathData : information$2.pathData;
	var information = "information";

	exports.accData = information$1.accData;
	exports.ltr = information$1.ltr;
	exports.default = information;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
