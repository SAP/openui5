sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/end-user-experience-monitoring', './v4/end-user-experience-monitoring'], function (Theme, endUserExperienceMonitoring$2, endUserExperienceMonitoring$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? endUserExperienceMonitoring$1 : endUserExperienceMonitoring$2;
	var endUserExperienceMonitoring = { pathData };

	return endUserExperienceMonitoring;

});
