sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/taxi', './v4/taxi'], function (Theme, taxi$2, taxi$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? taxi$1 : taxi$2;
	var taxi = { pathData };

	return taxi;

});
