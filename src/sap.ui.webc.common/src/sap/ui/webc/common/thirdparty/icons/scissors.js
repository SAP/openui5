sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/scissors', './v4/scissors'], function (Theme, scissors$2, scissors$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? scissors$1 : scissors$2;
	var scissors = { pathData };

	return scissors;

});
