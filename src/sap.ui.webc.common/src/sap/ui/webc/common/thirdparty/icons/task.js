sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/task', './v4/task'], function (Theme, task$2, task$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? task$1 : task$2;
	var task = { pathData };

	return task;

});
