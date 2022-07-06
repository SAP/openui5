sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/business-one', './v4/business-one'], function (exports, Theme, businessOne$1, businessOne$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? businessOne$1.pathData : businessOne$2.pathData;
	var businessOne = "business-one";

	exports.accData = businessOne$1.accData;
	exports.ltr = businessOne$1.ltr;
	exports.default = businessOne;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
