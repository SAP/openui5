sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/iphone', './v4/iphone'], function (Theme, iphone$2, iphone$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? iphone$1 : iphone$2;
	var iphone = { pathData };

	return iphone;

});
