sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/goalseek', './v4/goalseek'], function (Theme, goalseek$2, goalseek$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? goalseek$1 : goalseek$2;
	var goalseek = { pathData };

	return goalseek;

});
