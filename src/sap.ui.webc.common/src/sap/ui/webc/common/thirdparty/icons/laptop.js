sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/laptop', './v4/laptop'], function (Theme, laptop$2, laptop$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? laptop$1 : laptop$2;
	var laptop = { pathData };

	return laptop;

});
