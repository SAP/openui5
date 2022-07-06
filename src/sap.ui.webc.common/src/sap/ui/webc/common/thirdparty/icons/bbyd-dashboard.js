sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bbyd-dashboard', './v4/bbyd-dashboard'], function (exports, Theme, bbydDashboard$1, bbydDashboard$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bbydDashboard$1.pathData : bbydDashboard$2.pathData;
	var bbydDashboard = "bbyd-dashboard";

	exports.accData = bbydDashboard$1.accData;
	exports.ltr = bbydDashboard$1.ltr;
	exports.default = bbydDashboard;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
