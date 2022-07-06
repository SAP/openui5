sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/company-view', './v4/company-view'], function (exports, Theme, companyView$1, companyView$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? companyView$1.pathData : companyView$2.pathData;
	var companyView = "company-view";

	exports.accData = companyView$1.accData;
	exports.ltr = companyView$1.ltr;
	exports.default = companyView;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
