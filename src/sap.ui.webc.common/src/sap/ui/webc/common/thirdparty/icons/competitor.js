sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/competitor', './v4/competitor'], function (exports, Theme, competitor$1, competitor$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? competitor$1.pathData : competitor$2.pathData;
	var competitor = "competitor";

	exports.accData = competitor$1.accData;
	exports.ltr = competitor$1.ltr;
	exports.default = competitor;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
