sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/process', './v4/process'], function (Theme, process$2, process$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? process$1 : process$2;
	var process = { pathData };

	return process;

});
