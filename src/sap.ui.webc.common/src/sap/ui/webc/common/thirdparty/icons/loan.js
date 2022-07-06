sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/loan', './v4/loan'], function (exports, Theme, loan$1, loan$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? loan$1.pathData : loan$2.pathData;
	var loan = "loan";

	exports.accData = loan$1.accData;
	exports.ltr = loan$1.ltr;
	exports.default = loan;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
