sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/work-history', './v4/work-history'], function (exports, Theme, workHistory$1, workHistory$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? workHistory$1.pathData : workHistory$2.pathData;
	var workHistory = "work-history";

	exports.accData = workHistory$1.accData;
	exports.ltr = workHistory$1.ltr;
	exports.default = workHistory;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
