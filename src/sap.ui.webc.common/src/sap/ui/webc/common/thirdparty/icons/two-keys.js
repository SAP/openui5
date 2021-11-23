sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/two-keys', './v4/two-keys'], function (Theme, twoKeys$2, twoKeys$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? twoKeys$1 : twoKeys$2;
	var twoKeys = { pathData };

	return twoKeys;

});
