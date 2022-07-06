sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-monitor', './v4/sys-monitor'], function (exports, Theme, sysMonitor$1, sysMonitor$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysMonitor$1.pathData : sysMonitor$2.pathData;
	var sysMonitor = "sys-monitor";

	exports.accData = sysMonitor$1.accData;
	exports.ltr = sysMonitor$1.ltr;
	exports.default = sysMonitor;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
