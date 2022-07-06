sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/opportunities', './v4/opportunities'], function (exports, Theme, opportunities$1, opportunities$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? opportunities$1.pathData : opportunities$2.pathData;
	var opportunities = "opportunities";

	exports.accData = opportunities$1.accData;
	exports.ltr = opportunities$1.ltr;
	exports.default = opportunities;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
