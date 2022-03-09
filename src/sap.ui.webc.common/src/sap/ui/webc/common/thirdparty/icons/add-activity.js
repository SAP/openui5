sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-activity', './v4/add-activity'], function (Theme, addActivity$2, addActivity$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addActivity$1 : addActivity$2;
	var addActivity = { pathData };

	return addActivity;

});
