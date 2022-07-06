sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/end-user-experience-monitoring', './v4/end-user-experience-monitoring'], function (exports, Theme, endUserExperienceMonitoring$1, endUserExperienceMonitoring$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? endUserExperienceMonitoring$1.pathData : endUserExperienceMonitoring$2.pathData;
	var endUserExperienceMonitoring = "end-user-experience-monitoring";

	exports.accData = endUserExperienceMonitoring$1.accData;
	exports.ltr = endUserExperienceMonitoring$1.ltr;
	exports.default = endUserExperienceMonitoring;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
