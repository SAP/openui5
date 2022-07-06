sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/appointment', './v4/appointment'], function (exports, Theme, appointment$1, appointment$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? appointment$1.pathData : appointment$2.pathData;
	var appointment = "appointment";

	exports.accData = appointment$1.accData;
	exports.ltr = appointment$1.ltr;
	exports.default = appointment;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
