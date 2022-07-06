sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/electronic-medical-record', './v4/electronic-medical-record'], function (exports, Theme, electronicMedicalRecord$1, electronicMedicalRecord$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? electronicMedicalRecord$1.pathData : electronicMedicalRecord$2.pathData;
	var electronicMedicalRecord = "electronic-medical-record";

	exports.accData = electronicMedicalRecord$1.accData;
	exports.ltr = electronicMedicalRecord$1.ltr;
	exports.default = electronicMedicalRecord;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
