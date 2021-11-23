sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-process', './v4/add-process'], function (Theme, addProcess$2, addProcess$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? addProcess$1 : addProcess$2;
	var addProcess = { pathData };

	return addProcess;

});
