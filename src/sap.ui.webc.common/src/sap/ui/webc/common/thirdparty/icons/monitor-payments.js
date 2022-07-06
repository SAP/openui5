sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/monitor-payments', './v4/monitor-payments'], function (exports, Theme, monitorPayments$1, monitorPayments$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? monitorPayments$1.pathData : monitorPayments$2.pathData;
	var monitorPayments = "monitor-payments";

	exports.accData = monitorPayments$1.accData;
	exports.ltr = monitorPayments$1.ltr;
	exports.default = monitorPayments;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
