sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/activity-individual', './v4/activity-individual'], function (Theme, activityIndividual$2, activityIndividual$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? activityIndividual$1 : activityIndividual$2;
	var activityIndividual = { pathData };

	return activityIndividual;

});
