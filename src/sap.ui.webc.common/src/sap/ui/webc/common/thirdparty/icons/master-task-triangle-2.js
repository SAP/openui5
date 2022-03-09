sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/master-task-triangle-2', './v4/master-task-triangle-2'], function (Theme, masterTaskTriangle2$2, masterTaskTriangle2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? masterTaskTriangle2$1 : masterTaskTriangle2$2;
	var masterTaskTriangle2 = { pathData };

	return masterTaskTriangle2;

});
