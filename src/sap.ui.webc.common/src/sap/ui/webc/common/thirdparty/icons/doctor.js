sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/doctor', './v4/doctor'], function (exports, Theme, doctor$1, doctor$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? doctor$1.pathData : doctor$2.pathData;
	var doctor = "doctor";

	exports.accData = doctor$1.accData;
	exports.ltr = doctor$1.ltr;
	exports.default = doctor;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
