sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/physical-activity', './v4/physical-activity'], function (exports, Theme, physicalActivity$1, physicalActivity$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? physicalActivity$1.pathData : physicalActivity$2.pathData;
	var physicalActivity = "physical-activity";

	exports.accData = physicalActivity$1.accData;
	exports.ltr = physicalActivity$1.ltr;
	exports.default = physicalActivity;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
