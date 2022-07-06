sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/alert', './v4/alert'], function (exports, Theme, alert$1, alert$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? alert$1.pathData : alert$2.pathData;
	var alert = "alert";

	exports.accData = alert$1.accData;
	exports.ltr = alert$1.ltr;
	exports.default = alert;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
