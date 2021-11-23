sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/down', './v4/down'], function (Theme, down$2, down$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? down$1 : down$2;
	var down = { pathData };

	return down;

});
