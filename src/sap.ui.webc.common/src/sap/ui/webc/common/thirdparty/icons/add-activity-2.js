sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-activity-2', './v4/add-activity-2'], function (Theme, addActivity2$2, addActivity2$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? addActivity2$1 : addActivity2$2;
	var addActivity2 = { pathData };

	return addActivity2;

});
