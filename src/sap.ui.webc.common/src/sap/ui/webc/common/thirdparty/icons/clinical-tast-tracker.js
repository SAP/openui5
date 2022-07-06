sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/clinical-tast-tracker', './v4/clinical-tast-tracker'], function (exports, Theme, clinicalTastTracker$1, clinicalTastTracker$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? clinicalTastTracker$1.pathData : clinicalTastTracker$2.pathData;
	var clinicalTastTracker = "clinical-tast-tracker";

	exports.accData = clinicalTastTracker$1.accData;
	exports.ltr = clinicalTastTracker$1.ltr;
	exports.default = clinicalTastTracker;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
