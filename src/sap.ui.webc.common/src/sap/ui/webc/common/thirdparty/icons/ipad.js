sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/ipad', './v4/ipad'], function (Theme, ipad$2, ipad$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? ipad$1 : ipad$2;
	var ipad = { pathData };

	return ipad;

});
