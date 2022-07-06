sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/leads', './v4/leads'], function (exports, Theme, leads$1, leads$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? leads$1.pathData : leads$2.pathData;
	var leads = "leads";

	exports.accData = leads$1.accData;
	exports.ltr = leads$1.ltr;
	exports.default = leads;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
