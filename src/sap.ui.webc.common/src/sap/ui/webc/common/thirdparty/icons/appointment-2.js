sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/appointment-2', './v4/appointment-2'], function (exports, Theme, appointment2$1, appointment2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? appointment2$1.pathData : appointment2$2.pathData;
	var appointment2 = "appointment-2";

	exports.accData = appointment2$1.accData;
	exports.ltr = appointment2$1.ltr;
	exports.default = appointment2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
