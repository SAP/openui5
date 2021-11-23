sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/supplier', './v4/supplier'], function (Theme, supplier$2, supplier$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? supplier$1 : supplier$2;
	var supplier = { pathData };

	return supplier;

});
