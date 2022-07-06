sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/activity-assigned-to-goal', './v4/activity-assigned-to-goal'], function (exports, Theme, activityAssignedToGoal$1, activityAssignedToGoal$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? activityAssignedToGoal$1.pathData : activityAssignedToGoal$2.pathData;
	var activityAssignedToGoal = "activity-assigned-to-goal";

	exports.accData = activityAssignedToGoal$1.accData;
	exports.ltr = activityAssignedToGoal$1.ltr;
	exports.default = activityAssignedToGoal;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
