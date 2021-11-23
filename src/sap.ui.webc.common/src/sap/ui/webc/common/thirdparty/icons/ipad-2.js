sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/ipad-2', './v4/ipad-2'], function (Theme, ipad2$2, ipad2$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? ipad2$1 : ipad2$2;
	var ipad2 = { pathData };

	return ipad2;

});
