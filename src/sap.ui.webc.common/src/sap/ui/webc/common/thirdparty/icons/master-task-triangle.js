sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/master-task-triangle', './v4/master-task-triangle'], function (Theme, masterTaskTriangle$2, masterTaskTriangle$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? masterTaskTriangle$1 : masterTaskTriangle$2;
	var masterTaskTriangle = { pathData };

	return masterTaskTriangle;

});
