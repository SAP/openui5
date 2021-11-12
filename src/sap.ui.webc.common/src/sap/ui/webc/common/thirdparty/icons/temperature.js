sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/temperature', './v4/temperature'], function (Theme, temperature$2, temperature$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? temperature$1 : temperature$2;
	var temperature = { pathData };

	return temperature;

});
