sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/activities', './v4/activities'], function (Theme, activities$2, activities$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? activities$1 : activities$2;
	var activities = { pathData };

	return activities;

});
