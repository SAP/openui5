sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/activity-items', './v4/activity-items'], function (Theme, activityItems$2, activityItems$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? activityItems$1 : activityItems$2;
	var activityItems = { pathData };

	return activityItems;

});
