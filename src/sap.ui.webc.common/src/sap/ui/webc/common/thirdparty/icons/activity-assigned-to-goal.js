sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/activity-assigned-to-goal', './v4/activity-assigned-to-goal'], function (Theme, activityAssignedToGoal$2, activityAssignedToGoal$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? activityAssignedToGoal$1 : activityAssignedToGoal$2;
	var activityAssignedToGoal = { pathData };

	return activityAssignedToGoal;

});
