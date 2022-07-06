sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/activity-individual', './v4/activity-individual'], function (exports, Theme, activityIndividual$1, activityIndividual$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? activityIndividual$1.pathData : activityIndividual$2.pathData;
	var activityIndividual = "activity-individual";

	exports.accData = activityIndividual$1.accData;
	exports.ltr = activityIndividual$1.ltr;
	exports.default = activityIndividual;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
